import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { LoadingComponent } from '../loading/loading.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notice-modal',
  templateUrl: './notice-modal.component.html',
  styleUrls: ['./notice-modal.component.scss'],
})
export class NoticeModalComponent implements OnInit {
 
  basic; edu; work; profile_pic = null;
  mode; title; msg; heading; 

  constructor(private modalController: ModalController, private navParams: NavParams, private http: HttpClient, 
              private load: LoadingComponent) {
    
    this.mode = navParams.get('mode');  
    
    if(this.mode == 1)
    { this.heading = "Notice";  this.title = navParams.get('title');  this.msg = navParams.get('msg'); }
    else if(this.mode == 2)
    { this.heading = "Profile"; this.displayProfile(navParams.get('id')); }
    
   }

  ngOnInit() {}

  displayProfile(id)
  {
    let url = "https://roshniindia.net/project1/api/data.php"

    let data = {mode: "profile_data", pid: id}; 

    this.load.showLoading();
    this.http.post(url, data).subscribe(
      (response) =>
      {
        this.load.dismiss();

        this.basic = response[0];
        this.edu = response[1];
        this.work = response[2];

        if(this.basic.profile_pic)
          this.profile_pic = "data:image/jpeg;base64," + this.basic.profile_pic;
        else
          this.profile_pic = null;

        console.log(this.basic);
      },
      (err) => { console.log(JSON.stringify(err)); }
    );
  }

  originalOrder()
  { return 0; }

  dismissModal()
  {
    this.modalController.dismiss(null);
  }

}
