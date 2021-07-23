import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage'
import { LoadingComponent } from '../loading/loading.component';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { HomePage } from '../home/home.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  pid; formData; wait = true;

  constructor(private http: HttpClient, public toastController: ToastController, public alertController: AlertController,
              private nav: NavController, private store: Storage, private load: LoadingComponent, private oneSignal: OneSignal) {}

  ngOnInit()
  {
    this.formData = new FormGroup({utype: new FormControl(null, {validators: [Validators.required]}), 
                                  email: new FormControl(null, {validators: [Validators.required],}), 
                                  pass: new FormControl(null,  {validators: [Validators.required]})});
  }

  ionViewDidEnter()
  {
    this.store.get("mode").then(mode => 
      {
        if(mode)
        {
          let msg;

          if(mode == "reg_success")
            msg = "Registration Successfull! Login to proceed to Verification step.";
          else if(mode == "pass_success")
            msg = "Password changed Successfully."

          this.createToast(msg);
          this.store.clear();
        }       
      });
  }

  login_data(logData)
  {
    let url="https://roshniindia.net/project1/api/data.php";

    let d = []; 
    d.push({mode: "1", utype: logData.utype, uname: logData.email, pass: logData.pass});

    this.load.showLoading();
    this.http.post(url, d).subscribe((response) => 
    {
      this.load.dismiss();
      let act = JSON.parse(JSON.stringify(response));

      if(act.mode == "Found")
      {
        let data = {pid: act.pid, utype: act.utype, fname: act.fname, lname: act.lname, uname: act.uname, email: act.email, status: act.status};

        this.store.set("pid", act.pid); this.store.set("data", data);
        this.push_init(act.pid);
        this.getbadgeCount(act.pid);
        HomePage.pid = act.pid;
        if(act.utype == 'Non-Teaching-Staff')
          this.nav.navigateForward(["./home/tabs/home"]);
        else
          this.nav.navigateForward(["./home/tabs/dashboard"]);
      }
      else if(act.mode == "Otp_Verify")
      {
        let data = {pid: act.pid, utype: act.utype, fname: act.fname, lname: act.lname, uname: act.uname, email: act.email, status: act.status};
        
        this.store.set("pid", act.pid); this.store.set("data", data);
        this.nav.navigateForward(["/user-verify"], {skipLocationChange: true});
      }
      else if(act.mode == "Not Found")
        this.createAlert("This username or email has not been registered. Sign Up or Try Again.");
      else if(act.mode == "Invalid Pass")
        this.createAlert("Your password does not match with registered account. In case you forgot password click Forgot Password link to reset it.");
    }, 
    (err) => {
      console.log(JSON.stringify(err));
      alert("Server Error: " + JSON.stringify(err));
    });
  }

  async createAlert(msg)
  {
    const alert = await this.alertController.create({
      header: "Error",
      message: msg,
      cssClass: "danger",
      buttons: [
        {
          text: "Okay",
          role: "cancel",
        }
      ]
    });

    alert.present();
  }

  async createToast(msg)
  {
    const toast = await this.toastController.create({
      message: msg,
      position: "bottom",
      color: "success",
      buttons: [
        {
          text: "",
          role: "cancel",
          icon: "close-outline"
        }
      ]
    });

    toast.present();
  }

  push_init(pid)
  {
    this.oneSignal.startInit('1981731a-18e3-4605-b23c-d84657999b8d', '952908462627');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);
    
    this.oneSignal.handleNotificationReceived().subscribe(() => {
      this.getbadgeCount(pid);
    });

    this.oneSignal.endInit();

    this.oneSignal.getIds().then(ids => {this.save_device(pid, ids)});
  }

  save_device(pid, ids)
  { 
    this.http.post('https://roshniindia.net/project1/api/data.php', {mode: 'push_notice', pid: pid, devId: ids.userId})
    .subscribe(response => {},
    err => {alert(JSON.stringify(err))
    });
  }

  getbadgeCount(pid)
  {
    this.http.post('https://roshniindia.net/project1/api/data.php', {mode: 'get_badge_count', pid: pid})
    .subscribe(response => {
      HomePage.badgeCount = parseInt(response + "");
    },
    err => {alert(JSON.stringify(err))
    });
  }

}
