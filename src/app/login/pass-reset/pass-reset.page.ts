import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, NavController } from '@ionic/angular';
import { FormGroup, FormControl } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-pass-reset',
  templateUrl: './pass-reset.page.html',
  styleUrls: ['./pass-reset.page.scss'],
})
export class PassResetPage implements OnInit {

  step; pid; time; resendBtn;
  formData; otp; 

  constructor(private http: HttpClient, private alert: AlertController, private nav: NavController, private store: Storage,
              private load: LoadingComponent) 
  { this.step = 1; }

  ngOnInit() {

    this.formData = new FormGroup({email: new FormControl(""), otp: new FormControl(""), pass: new FormControl(""), cnfmPass: new FormControl()});
  }

  generate_otp()
  {
    let url="https://roshniindia.net/project1/api/user_pass_verify.php";

    let data = {pid: this.pid, mode: "otp_gen"};

    this.load.showLoading();
    this.http.post(url, data).subscribe((response) => {
      this.load.dismiss();
    },
    (err) => { console.log("Error: " + JSON.stringify(err)); alert("Error: " + JSON.stringify(err)); });
  }

  async resend()
  {
    this.generate_otp();
    this.disable_button();
    this.createAlert("Message", "A code has been send to your mail.", "");
  }

  disable_button()
  {
    this.time = 60;
    this.resendBtn = true;
    let timer = setInterval(() => {
    this.time--;
    if(this.time == 0)
    { clearInterval(timer); this.resendBtn = false; }
    }, 1000);
  }

  email_verify(fdata)
  {
    let url="https://roshniindia.net/project1/api/user_pass_verify.php";

    let data = {email: fdata.email, mode: "email_verify"};

    this.load.showLoading();
    this.http.post(url, data).subscribe((response) => {
      this.load.dismiss();

      let resp = JSON.parse(JSON.stringify(response));

      if(resp.msg == "success")
      {
        this.step = 2;
        this.pid = resp.pid;
        this.generate_otp();
        this.disable_button();
      }
      else if(resp.msg == "invalid")
        this.createAlert("Error", "This email has not been registered. Please Try Again or Sign Up.", "danger");
    },
    (err) => { console.log("Error: " + JSON.stringify(err)); alert("Error: " + JSON.stringify(err)); });
  }

  otp_verify(fdata)
  {
    let url="https://roshniindia.net/project1/api/user_pass_verify.php";

    let data = {pid: this.pid, mode: "otp_verify", otp: fdata.otp};

    this.load.showLoading();
    this.http.post(url, data).subscribe((response) => {
      this.load.dismiss();

      if(response == "verified")
        this.step = 3;
      else if(response == "invalid")
        this.createAlert("Error", "The OTP entered is not valid. Please try again.", "danger");
    },
    (err) => { console.log("Error: " + JSON.stringify(err)); alert("Error: " + JSON.stringify(err)); });   
  }

  pass_reset(fdata)
  {
    let url="https://roshniindia.net/project1/api/user_pass_verify.php";

    let data = {pid: this.pid, mode: "pass_reset", pass: fdata.pass};

    this.load.showLoading();
    this.http.post(url, data).subscribe((response) => {
      this.load.dismiss();

      if(response == "success")
      {
        this.store.set("mode", "pass_success");
        this.nav.navigateBack(["./login"]);
      }  
    },
    (err) => { console.log("Error: " + JSON.stringify(err)); alert("Error: " + JSON.stringify(err)); });
  }

  async createAlert(title, msg, clss)
  {
    const alert = await this.alert.create({
      header: title,
      message: msg,
      cssClass: clss,
      buttons: [
        {
          text: "Okay",
          role: "cancel",
        }
      ]
    });

    alert.present(); 
  }
}
