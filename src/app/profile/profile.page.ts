import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, NavParams, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  basic; edu; work; profile_pic = null;
  pid; readOnce = true;

  constructor(private http: HttpClient, private nav: NavController, private store: Storage, private load: LoadingComponent) {}

  ngOnInit() 
  {}

  
  ionViewDidEnter()
  {
    if(this.readOnce)
    {
      this.store.get("pid").then(pid => {
        if(pid)
        { 
          this.pid = pid;
          this.readOnce = false;
          this.displayProfile();      
        }  
      });
    }
    else
      this.displayProfile();
  }

  displayProfile()
  {
    let url = "https://roshniindia.net/project1/api/data.php"

    let data = {mode: "profile_data", pid: this.pid}; 

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

  edit_profile()
  {
    this.nav.navigateForward(["/home/tabs/profile/edit-profile"], {skipLocationChange: true});
  }

  doRefresh(event)
  {
    setTimeout(() => {
      event.target.complete();
      this.displayProfile();
    }, 2000);
  }

}
