import { Component, ViewChild } from '@angular/core';
import { ModalController, IonList } from '@ionic/angular';
import { NoticeModalComponent } from '../notice-modal/notice-modal.component';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';
import { HomePage } from '../home/home.page';

@Component({
  selector: 'app-notice',
  templateUrl: './notice.page.html',
  styleUrls: ['./notice.page.scss'],
})
export class NoticePage {

  list; wait;
  @ViewChild('lista', {static: false}) listController: IonList;

  constructor(private modalController: ModalController, private http: HttpClient, private storage: Storage, private datePipe: DatePipe) 
  {}

  ionViewDidEnter()
  {
    if(HomePage.badgeCount)
    {
      HomePage.badgeCount = 0;
      this.getNotifications(); 
    }
    else
      this.getNotifications();
  }

  getNotifications()
  {
    this.wait = true;
    this.http.post('https://roshniindia.net/project1/api/data.php', {mode: 'get_notices', pid: HomePage.pid})
    .subscribe(response => {
      this.wait = false;
      this.list = response;
      if(response)
      {  this.parseDate(); }
    }, err => { alert(JSON.stringify(err)); });    
  }

  async showNotice(i)
  {
    let title = this.list[i]['title'], msg = this.list[i]['msg'];

    const modal = await this.modalController.create({component: NoticeModalComponent, 
                    componentProps: {mode: 1, title: title, msg: msg}, backdropDismiss: false});

    this.http.post('https://roshniindia.net/project1/api/data.php', 
                    {mode: 'update_notices', act: 'update', id: this.list[i]['id'], user_id: this.list[i]['user_id']})
              .subscribe(response => {}, err => {alert(JSON.stringify(err))});

    await modal.present();

    await modal.onWillDismiss().then(() => {this.getNotifications();});
  }

  remove(i)
  {
    this.http.post('https://roshniindia.net/project1/api/data.php', 
                    {mode: 'update_notices', act: 'delete', id: this.list[i]['id'], user_id: this.list[i]['user_id']})
              .subscribe(response => {}, err => {alert(JSON.stringify(err))});

    this.listController.closeSlidingItems();

    this.list.splice(i,1);
  }

  parseDate()
  {
    let count = this.list.length;

    for(let i = 0; i < count; i++)
      this.list[i]['date'] = this.datePipe.transform(new Date(this.list[i]['date']), 'dd MMMM, y, hh:mm a');
  }

  doRefresh(event)
  {
    setTimeout(() => {
      event.target.complete();
      this.ionViewDidEnter();
    }, 2000);
  }

}
