import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage {

  form;
  clss = ['MCA', 'MSc']; sems = ['I', 'II', 'III', 'IV', 'V'];

  constructor(private http: HttpClient, private alertController: AlertController, private toastController: ToastController,
              private load: LoadingComponent) 
  {
    this.form = new FormGroup({clss: new FormControl(null, Validators.required), fromSem: new FormControl(null, Validators.required), 
                              toSem: new FormControl(null, Validators.required), clss2: new FormControl(null, Validators.required),
                              sem: new FormControl(null, Validators.required)});
  }

  async createAlert(mode)
  {
    let msg, btnText;

    if(mode == 1)
    {
      msg = "Are you sure you want to promote all students from " + this.form.get('clss').value + " Semester-" +
      this.form.get("fromSem").value + " to Semester-" + this.form.get('toSem').value + "?";
      btnText = "Promote";
    }
    else if(mode == 2)
    { msg = "Are you sure you want to delete attendance records of previous semester?"; btnText = "Delete"; }

    const alert = await this.alertController.create({
      header: "Message",
          message: msg,
          buttons: [{
            text: "Cancel",
            role: "cancel"
          },
          {
            text: btnText,
            handler: () => {
              this.promote(mode);
            }
          }]  
    });

    await alert.present();
  }

  promote(mode)
  {
    let url = "https://roshniindia.net/project1/api/data.php", data;

    if(mode == 1)
      data = {mode: 'admin_option', act: 'promote_students', clss: this.form.get('clss').value, sem: this.form.get('toSem').value};
    else if(mode == 2)
      data = {mode: 'admin_option', act: 'delete_att_records', clss: this.form.get('clss2').value, sem: this.form.get('sem').value};

    this.load.showLoading();
    this.http.post(url, data)
    .subscribe(response => {
      this.load.dismiss();
      if(mode == 1)
        this.createToast("Success. " + response + " students updated.");
      else if(mode == 2)
        this.createToast("Attendance Records deleted successfuly."); console.log(response)}, err => alert(JSON.stringify(err)));
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
    })

    await toast.present();
  }

}
