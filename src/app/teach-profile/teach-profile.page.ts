import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingComponent } from '../loading/loading.component';
import { NoticeModalComponent } from '../notice-modal/notice-modal.component';

@Component({
  selector: 'app-teach-profile',
  templateUrl: './teach-profile.page.html',
  styleUrls: ['./teach-profile.page.scss'],
})
export class TeachProfilePage {

  list;

  constructor(private http: HttpClient, private modalController: ModalController, private load: LoadingComponent) { }

  ionViewDidEnter()
  {
    let url = "https://roshniindia.net/project1/api/data.php"

    this.load.showLoading();
    this.http.post(url, {mode: "viewUserList", utype: "Teaching-Staff"})
    .subscribe(response => {
      this.load.dismiss();
      this.list = response;
    }, err => {console.log(err);});
  }

  async showProfile(id)
  {
    const modal = this.modalController.create({component: NoticeModalComponent, componentProps: {mode: 2, id: this.list[id]['id']}, 
                  backdropDismiss: false});

    (await modal).present();
  }

}
