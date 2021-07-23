import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.scss'],
})
export class ModalContentComponent implements OnInit {

  title = ""; mode; act; callServer
  val = null; deleteBtn; data;  
  pid; basic; contact; eduForm; workForm

  constructor(public modalController: ModalController, private alertController: AlertController,
               public navParams: NavParams, private http: HttpClient, private load: LoadingComponent) 
  { 
    this.title = navParams.get("title");
    this.mode = navParams.get("mode");
    this.act = navParams.get("act");

    if(this.act == "register")
    {
      this.callServer = false;
      this.val = "";  this.deleteBtn = false;
    }
    else if(this.act == "edit")
    {
      this.callServer = true; this.deleteBtn = true;
      this.val = navParams.get("data"); this.pid = navParams.get("pid");
    }
    else if(this.act == "add")
    { 
      this.callServer = true;
      this.val = "";
    }
      
  }

  ngOnInit() 
  {
    if(this.mode == 1)
      this.basic = new FormGroup({fath: new FormControl(this.val.fathers_name, {validators: [Validators.pattern('[a-zA-Z .]*')]}), 
      moth: new FormControl(this.val.mothers_name, {validators: [Validators.pattern('[a-zA-Z .]*')]}), 
      dob: new FormControl(this.val.DOB, {validators: [Validators.required]}), 
      gender: new FormControl(this.val.gender, {validators: [Validators.required]})});
    else if(this.mode == 2)
      this.contact = new FormGroup({address: new FormControl(this.val.address, {validators: Validators.required}), 
        city: new FormControl(this.val.city, {validators: [Validators.required, Validators.pattern('[a-zA-Z .]+')]}), 
        state: new FormControl(this.val.state, {validators: [Validators.required, Validators.pattern('[a-zA-Z .]+')]}), 
        zipcode: new FormControl(this.val.zipcode, {validators: [Validators.required, Validators.pattern('\\d{6}')]}), 
        country: new FormControl(this.val.country, {validators: [Validators.required, Validators.pattern('[a-zA-Z .]+')]}), 
        phone: new FormControl(this.val.phone, {validators: [Validators.required, Validators.pattern('\\d{10}')]}),
        email: new FormControl(this.val.email, {validators: [Validators.required, Validators.pattern('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$')]})});
    else if(this.mode == 3)
      this.eduForm = new FormGroup({year: new FormControl(this.val.year, {validators: Validators.required}), 
      qual: new FormControl(this.val.qual), sub: new FormControl(this.val.spec), 
      schl: new FormControl(this.val.schl, {validators: Validators.required}), marks: new FormControl(this.val.marks)});
    else if(this.mode == 4)
      this.workForm = new FormGroup({year: new FormControl(this.val.years, {validators: Validators.required}), 
      company: new FormControl(this.val.org, {validators: Validators.required}), role: new FormControl(this.val.role)});
  }

  dismissModal(data)
  {
    this.modalController.dismiss(data);
  }

  addData(data)
  {
      if(this.callServer)
      {
        data["mode"] = "update_profile";
        data["pid"] = this.pid;

        if(this.mode == 1)
          data["act"] = "basic";
        else if(this.mode == 2)
          data["act"] = "contact";
        else if(this.mode == 3)
        {
          data["act"] = this.act == "edit" ? "edu" : "addEdu";
          data["id"] = this.val.id;
        }
        else if(this.mode == 4)
        {
          data["act"] = this.act == "edit" ? "work" : "addWork";
          data["id"] = this.val.id;
        }

        if( this.mode == 3 && data != null && data.year)
          data.year = data.year.substring(0,4);

        let url = "https://roshniindia.net/project1/api/data.php";

        this.load.showLoading();
        this.http.post(url, data).subscribe(
          (response) =>
          {
            this.load.dismiss();
            this.dismissModal(null);
            console.log(response);
          },
          (err) => { console.log(JSON.stringify(err)); }
        );
      }
      else
        this.dismissModal(data);
  }

  async createAlert(mode)
  {
    let title = (mode == "delEdu") ? this.val.schl : this.val.org;

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
              this.data["mode"] = "update_profile";
              this.data["act"] = mode; this.data["id"] = this.val.id;
              this.data["pid"] = this.pid;
              
              let url = "https://roshniindia.net/project1/api/data.php";

              this.load.showLoading();
              this.http.post(url, this.data).subscribe(
                (response) =>
                {
                  this.load.dismiss();
                  this.dismissModal(null);
                  console.log(response);
                },
                (err) => { console.log(JSON.stringify(err)); }
              );
            }
          }]  
    })

    await alert.present();
  }

  limitNumber(data, type)
  {
    if(type == 'phone' && data.phone && data.phone.toString().length > 10)
      this.contact.patchValue({phone: data.phone.toString().substring(0,10)});
    else if(type == 'zip' && data.zipcode && data.zipcode.toString().length > 6)
      this.contact.patchValue({zipcode: data.zipcode.toString().substring(0,6)});
  }

}
