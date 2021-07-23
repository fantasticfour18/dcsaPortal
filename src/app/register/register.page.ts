import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, NavController } from '@ionic/angular';
import { ModalContentComponent } from '../modal-content/modal-content.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})

export class RegisterPage implements OnInit {

  step;
  lines: string[];
  step_disp = "Step 1-4";
  iconColor: string[];
  badgeClr: string[];
  formData1; formData2;
  userData = []; eduData = []; workData = []; 

  constructor(public modalController: ModalController, public alertController: AlertController, private http: HttpClient,
    private route: Router, private nav: NavController, private store: Storage, private load: LoadingComponent) { 
    this.step = 1;
    this.lines = ["lines", "lines", "lines", "lines"];
    this.iconColor = ["success", "", "", ""];
    this.badgeClr = ["light", "none", "none", "none"]
  }

  ngOnInit() {
    this.formData1 = new FormGroup({utype: new FormControl(null, {validators: [Validators.required]}),
    clss: new FormControl(null, {validators: [Validators.required]}),
    semester: new FormControl(null, {validators: [Validators.required]}),
    shift: new FormControl(null, {validators: [Validators.required]}), 
    uname: new FormControl(null, {validators: [Validators.required, Validators.minLength(6)]}), 
    pass: new FormControl(null, {validators: [Validators.required, 
      Validators.pattern('^.*(?=.{8,})((?=.*[!@#$%^&*()\\-_=+{};:,<.>]){1})(?=.*\\d)((?=.*[a-z]){1}()(?=.*[A-Z]){1}).*$')]}),
    cnfmPass: new FormControl(null, {validators: [Validators.required]})}, this.comparePass);

    this.formData2 = new FormGroup({fname: new FormControl(null, {validators: [Validators.required, Validators.pattern('[a-zA-Z]+')]}), 
    lname: new FormControl(null, {validators: [Validators.required, Validators.pattern('[a-zA-Z]+')]}), 
    fathname: new FormControl(null, {validators: [Validators.pattern('[a-zA-Z .]*')]}),
    mothname: new FormControl(null, {validators: [Validators.pattern('[a-zA-Z .]*')]}), 
    dob: new FormControl(null, {validators: [Validators.required]}),
    gender: new FormControl(null, {validators: [Validators.required]}),
    address: new FormControl(null, {validators: [Validators.required]}), 
    city: new FormControl(null, {validators: [Validators.required, Validators.pattern('[a-zA-Z .]+')]}), 
    state: new FormControl(null, {validators: [Validators.required, Validators.pattern('[a-zA-Z .]+')]}),
    zipcode: new FormControl(null, {validators: [Validators.required, Validators.pattern('\\d{6}')]}), 
    country: new FormControl(null, {validators: [Validators.required, Validators.pattern('[a-zA-Z .]+')]}), 
    phone: new FormControl(null, {validators: [Validators.required, Validators.pattern('\\d{10}')]}),
    email: new FormControl(null, {validators: [Validators.required, Validators.pattern('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$')]})});
  }

  nextStep(step, btnmode)
  {
    let data;

    if((step == 2 || step == 3) && btnmode != "back")
    {
      data = (step == 2) ? {mode: "username_check", uname: this.formData1.get('uname').value} : {mode: "email_check", email: this.formData2.get('email').value}   
      let url="https://roshniindia.net/project1/api/data.php";

      this.load.showLoading();
      this.http.post(url, data).subscribe((response) => {
      this.load.dismiss();
      
      if(response == "user_avail")
        this.showStep(btnmode, step);
      else
      {
        let msg = (step == 2) ? "username" : "email";
        this.createErrorAlert(msg);
      }
    }, (err) => {
      console.log("Error: " + JSON.stringify(err));
      alert("error"+JSON.stringify(err));
    });  
    }
    else
      this.showStep(btnmode, step);
    
    
  }

  showStep(btnmode, step)
  {
    this.step = step;

    if(btnmode == "next")
    {
      this.iconColor[step-1] = "success";
      this.badgeClr[step-1] = "light";
      this.badgeClr[step-2] = "none";
      this.lines[step-2] = "lines line-active";
      this.step_disp = "Step " + step + "-4";
    }
    else if(btnmode == "back")
    {
      this.iconColor[step] = "";
      this.badgeClr[step-1] = "light";
      this.badgeClr[step] = "none";
      this.lines[step-1] = "lines line-inactive";
      this.step_disp = "Step " + step + "-4";
    } 
  }

  async createModal(mode)
  {
    const title = (mode == 3) ? "Add Education" : "Add Work Experience";
    let dataArray = (mode == 3) ? this.eduData : this.workData;

    const modal = await this.modalController.create({component: ModalContentComponent, 
                                                    componentProps: {"title": title, "mode": mode, "act": "register"}, backdropDismiss: false});
    await modal.present();

    await modal.onWillDismiss().then((mdata) => {
    let data = mdata['data'];

    if(data != null && data.year)
    {
      data.year = data.year.substring(0,4);
      dataArray.push(data);
    }
    });
  }

  async createErrorAlert(msg)
  {
    const alert = await this.alertController.create({
          header: "Error",
          message: "The " + msg + " you have entered is already taken. Please try different " + msg + ".",
          cssClass: "danger",
          buttons: [{
            text: "Okay",
            role: "cancel"
          }]  
    })

    await alert.present();
  }

  async createAlert(title, index, mode)
  {
    let data = (mode == 1) ? this.eduData : this.workData;

    const alert = await this.alertController.create({
          header: "Delete " + title,
          message: "Are you sure you want to delete this field ?",
          buttons: [{
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Delete",
            handler: () => {
              data.splice(index, 1);
            }
          }]  
    })

    await alert.present();
  }

  async createAccount(data1, data2)
  {
    let p = {utype: data1.utype, uname: data1.uname, pass: data1.pass, fname: data2.fname, lname: data2.lname,
             fathname: data2.fathname, mothname: data2.mothname, dob: data2.dob, gender: data2.gender,
             address: data2.address, city: data2.city, state: data2.state, zipcode: data2.zipcode, 
             country: data2.country, phone: data2.phone, email: data2.email};
    
    if(data1.utype == 'Student')
    { p['clss'] = data1.clss; p['semester'] = data1.semester; p['shift'] = data1.shift; }
    else
    { p['clss'] = p['semester'] = p['shift'] = ""; }
    
    this.userData.push({mode: "2"});
    this.userData.push(p);
    this.userData.push(this.eduData);
    this.userData.push(this.workData);

    
    let url="https://roshniindia.net/project1/api/data.php";

    this.load.showLoading();
    this.http.post(url, this.userData).subscribe((response) => {
      this.load.dismiss();
      
      if(response == "reg_success")
      {
          this.store.set("mode", "reg_success");
          this.nav.navigateBack(["/login"]);
      }
      
      console.log(response);
      
    }, (err) => {
      console.log("Error: " + JSON.stringify(err));
      alert("error"+JSON.stringify(err));
    });
  }

  limitNumber(data, type)
  {
    if(type == 'phone' && data.phone && data.phone.toString().length > 10)
      this.formData2.patchValue({phone: data.phone.toString().substring(0,10)});
    else if(type == 'zip' && data.zipcode && data.zipcode.toString().length > 6)
      this.formData2.patchValue({zipcode: data.zipcode.toString().substring(0,6)});
  }

  comparePass(formData)
  {
    if(formData.get('pass').value != formData.get('cnfmPass').value)
      formData.get('cnfmPass').setErrors({PassMatch: "Passwords do not match."});
    return null;
  }
}