import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-settings-mod',
  templateUrl: './settings-mod.component.html',
  styleUrls: ['./settings-mod.component.scss'],
})
export class SettingsModComponent implements OnInit {

  mode; title; data; form; act; formData;
  time; resendBtn; otp; verbtn = true;

  constructor(public modalController: ModalController, private alertController: AlertController,
    private http: HttpClient, private load: LoadingComponent, private navParams: NavParams, private store: Storage) 
    { 
      this.mode = navParams.get("mode");
      this.data = navParams.get("data");
    }

  ngOnInit() {

    if(this.mode == 1)
    {
      this.title = "Name"; this.act = "name"
      this.form = new FormGroup({fname: new FormControl(this.data.fname, {validators: [Validators.required, Validators.pattern('[a-zA-Z .]*')]}),
                                 lname: new FormControl(this.data.lname, {validators: [Validators.required, Validators.pattern('[a-zA-Z .]*')]})});

    }
    else if(this.mode == 2)
    {
      this.title = "Username"; this.act = "uname";
      this.form = new FormGroup({uname: new FormControl(this.data.uname, {validators: [Validators.required, Validators.minLength(6)]})});
    }
    else if(this.mode == 3)
    {
      this.title = "Email"; this.act = "email";
      this.form = new FormGroup({email: new FormControl(this.data.email, 
                                {validators: [Validators.required, Validators.pattern('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$')]})});
    }
    else if(this.mode == 4)
    {
      this.title = "Password"; this.act = "pass";
      this.form = new FormGroup({pass: new FormControl(null, {validators: [Validators.required]}), new_pass: new FormControl(null, 
              {validators: [Validators.required, 
              Validators.pattern('^.*(?=.{8,})((?=.*[!@#$%^&*()\\-_=+{};:,<.>]){1})(?=.*\\d)((?=.*[a-z]){1}()(?=.*[A-Z]){1}).*$')]}),
              cnfmPass: new FormControl(null, {validators: [Validators.required]})}, this.comparePass);
    }

  }

  dismiss()
  {
    this.modalController.dismiss(null);
  }

  save(form)
  {
    this.formData = {mode: "update_profile", act: this.act, pid: this.data.pid};

    if(this.mode == 1)
    { 
      if(this.data.fname != form.fname || this.data.lname != form.lname)
      { this.formData['fname'] = form.fname; this.formData['lname'] = form.lname; this.update_data(); }
      else
        this.dismiss();
    }
    else if(this.mode == 2)
    {
      if(this.data.uname != form.uname)
      {
        this.formData['uname'] = form.uname;
        this.check_avail({mode: "username_check", uname: form.uname});
      }
      else
        this.dismiss();
    }
    else if(this.mode == 3)
    {
      if(this.data.email != form.email)
      {
        this.formData['email'] = form.email;
        this.check_avail({mode: "email_check", email: form.email});
      }
      else
        this.dismiss();
    }
    else if(this.mode == 5)
    {
      this.formData["pwd"] = form.new_pass;
      this.update_data();
    }
      
  }

  check_avail(data)
  {
    let url = "https://roshniindia.net/project1/api/data.php";
   
    this.load.showLoading();
    this.http.post(url, data).subscribe(
      (response) =>
      {
        this.load.dismiss();

        if(response != "user_avail")
        {
          let msg = (this.mode == 2) ? "username" : "email";
          this.createErrorAlert("The " + msg + " you have entered is already taken. Please try different " + msg + ".");
        }
        else if(this.mode == 3)
        {
          this.mode = 6;
          this.generate_otp();
          this.disable_button();
        }
        else
          this.update_data();

        console.log(response);
      },
      (err) => { console.log(JSON.stringify(err)); }
    );

  }

  async createErrorAlert(msg)
  {
    const alert = await this.alertController.create({
          header: "Error",
          message: msg,
          cssClass: "danger",
          buttons: [{
            text: "Okay",
            role: "cancel"
          }]  
    })

    await alert.present();
  }

  update_data()
  {
    let url = "https://roshniindia.net/project1/api/data.php";
   
    this.load.showLoading();
        this.http.post(url, this.formData).subscribe(
          (response) =>
          {
            this.load.dismiss();
            this.dismiss();

            let data = {pid: this.data.pid, fname: this.data.fname, lname: this.data.lname, 
              uname: this.data.uname, email: this.data.email};

            if(this.mode == 1)
            { data['fname'] = this.formData.fname;  data['lname'] = this.formData.lname;  }
            else if(this.mode == 2)
              data['uname'] = this.formData.uname;
            else if(this.mode == 6)
              data['email'] = this.formData.email;

            this.store.set("data", data);

            console.log(response);
          },
          (err) => { console.log(JSON.stringify(err)); }
        );
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

  generate_otp()
  {
    let url="https://roshniindia.net/project1/api/user_pass_verify.php";

    let data = {pid: this.data.pid, mode: "otp_gen"};

    this.load.showLoading();
    this.http.post(url, data).subscribe((response) => {
      this.load.dismiss();
    },
    (err) => { console.log("Error: " + JSON.stringify(err)); alert("Error: " + JSON.stringify(err)); });
  }

  get_OTP(code)
  {
    if(code.length == 4)
    {
      this.otp = code;
      this.verbtn = false;
    }
    else
      this.verbtn = true;
  }

  async resend()
  {
    this.generate_otp();
    this.disable_button();
  }

  verify()
  {  
      let url="https://roshniindia.net/project1/api/user_pass_verify.php";

      let data = {pid: this.data.pid, mode: "otp_verify", otp: this.otp};
      
      this.load.showLoading();
      this.http.post(url, data).subscribe((response) => {
        this.load.dismiss();
        if(response == "verified")
          this.update_data();
        else if(response == "invalid")
        { this.createErrorAlert("The OTP entered is not valid. Please try again."); console.log(response); }

      },
      (err) => { console.log("Error: " + JSON.stringify(err)); })
  }

  verify_pass(form)
  {
    let url = "https://roshniindia.net/project1/api/data.php";

    this.load.showLoading();
    this.http.post(url, {mode: "pass_check", pid: this.data.pid, pwd: form.pass}).subscribe(response => {
      this.load.dismiss();
      if(response == "verified")
        this.mode = 5;
      else 
        this.createErrorAlert("Incorrect Password. Try again or click on forgot password to reset.");
    }, err => {alert(err)});
  }

  comparePass(form)
  {
    if(form.get('new_pass').value != form.get('cnfmPass').value)
      form.get('cnfmPass').setErrors({PassMatch: "Passwords do not match."});
    return null;
  }

}
