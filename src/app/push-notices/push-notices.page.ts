import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-push-notices',
  templateUrl: './push-notices.page.html',
  styleUrls: ['./push-notices.page.scss'],
})
export class PushNoticesPage{

  form;

  constructor(private http: HttpClient, private alertController: AlertController, private toastController: ToastController,
              private load: LoadingComponent) 
  { 
    this.form = new FormGroup({title: new FormControl(null, Validators.required), msg: new FormControl(null, Validators.required)});
  }

  async createAlert(mode)
  {
    const alert = await this.alertController.create({
      header: "Message",
          message: "Are you sure you want to send this push notification to all teachers and students of this department?",
          buttons: [{
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Send",
            handler: () => {
              this.sendPush();
            }
          }]  
    });

    await alert.present();
  }

  sendPush()
  {
    let url = "https://roshniindia.net/project1/api/data.php", data;
    data = {mode: 'admin_option', act: 'push_notices', title: this.form.get('title').value, msg: this.form.get('msg').value};

    this.load.showLoading();
    this.http.post(url, data).subscribe(response => {
      this.load.dismiss();
      this.form.patchValue({title: '', msg: ''});
      this.createToast("Push Notification send successfuly.");
    }, err => { alert(JSON.stringify(err)); });
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
