import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { LoadingComponent } from '../../loading/loading.component';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';
import { OneSignal } from '@ionic-native/onesignal';
import { HomePage } from '../../home/home.page';

@Component({
  selector: 'app-user-verify',
  templateUrl: './user-verify.page.html',
  styleUrls: ['./user-verify.page.scss'],
})
export class UserVerifyPage implements OnInit {

  title; verbtn = true;
  time;
  resendBtn;
  step; pid; otp; utype;

  constructor(public alert: AlertController, public actSheetController: ActionSheetController, private nav: NavController, 
              private store: Storage, private http: HttpClient, private load: LoadingComponent, private oneSignal: OneSignal,
              private camera: Camera, private file: FileTransfer, private fileObject: FileTransferObject) { this.step = 1 }

  ngOnInit() {

    this.store.get("data").then(data => {
      if(data.utype)
      { this.utype = data.utype; }
    });
  
    this.store.get("pid").then(pid => {
      if(pid)
      {
        this.pid = pid;
        this.generate_otp();
      }
    });
      
    if(this.step == 1)
    {
        this.title = "User Verification";
        this.disable_button();
    }       
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

    let data = {pid: this.pid, mode: "otp_gen"};

    this.load.showLoading();
    this.http.post(url, data).subscribe((response) => {
      this.load.dismiss();
    },
    (err) => { console.log("Error: " + JSON.stringify(err)); alert("Error: " + JSON.stringify(err)); });
  }

  verify()
  {
      
      let url="https://roshniindia.net/project1/api/user_pass_verify.php";

      let data = {pid: this.pid, mode: "otp_verify", otp: this.otp};
      
      this.load.showLoading();
      this.http.post(url, data).subscribe((response) => {
        this.load.dismiss();
        if(response == "verified")
        {
          this.title = "Upload Profile Picture";
          this.step = 2;
        }
        else if(response == "invalid")
        { this.showAlert("Error", "The OTP entered is not valid. Please try again.", "danger"); console.log(response); }

      },
      (err) => { console.log("Error: " + JSON.stringify(err)); })
  }

  redirect()
  {
    this.push_init(this.pid);
    this.getbadgeCount(this.pid);
    HomePage.pid = this.pid;
    if(this.utype == 'Non-Teaching-Staff')
      this.nav.navigateForward(["./home/tabs/home"]);
    else
      this.nav.navigateForward(["./home/tabs/dashboard"]);
  }

  async resend()
  {
    this.generate_otp();
    this.disable_button();
    this.showAlert("Message", "A code has been send to your mail.", "");
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

  async showAlert(title, msg, clss)
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

  async showAction()
  {
    const options: CameraOptions = {
      quality: 100,
      targetWidth: 300,
      targetHeight: 290,
      correctOrientation: true
    };

    const actSheet = await this.actSheetController.create({
      header: "Upload Photo",
      buttons: [{ text: "Choose Photo",
        icon: "image",
        handler: () => {
          options.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
          options.allowEdit = true;
          this.camera.getPicture(options).then(image => {
            this.upload_server(image);
          }, err => {alert(err)});
        } 
      },
      {
        text: "Cancel",
        role: "cancel"
      }]
    })

    await actSheet.present();
  }

  upload_server(image)
  {
    let url = "https://roshniindia.net/project1/api/upload_profile_photo.php"

    this.fileObject = this.file.create();

    let fileOptions: FileUploadOptions = {
      fileKey: 'photo',
      fileName: 'profile.jpeg',
      chunkedMode: false,
      params: {pid: this.pid},
      mimeType: "multipart/form-data"
    }

    this.load.showLoading();
    this.fileObject.upload(image, url, fileOptions).then(
      (response) => 
      {
        this.load.dismiss();
        this.redirect();
      }, 
    err => {alert(JSON.stringify(err));});
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
