import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, AlertController } from '@ionic/angular';
import { ModalContentComponent } from '../../modal-content/modal-content.component';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { LoadingComponent } from '../../loading/loading.component';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  pid; profile_pic = null;
  basic; edu; work; readOnce = true;

  constructor(private http: HttpClient, private actSheetController: ActionSheetController, private store: Storage, 
              private modalController: ModalController, private load: LoadingComponent, private camera: Camera,
              private file: FileTransfer, private fileObject: FileTransferObject, private alertController: AlertController) { }

  ngOnInit() {}
  
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
          this.profile_pic = null

        console.log(this.basic);
      },
      (err) => { console.log(JSON.stringify(err)); }
    );
  }

  async showAction()
  {
    const options: CameraOptions = {
      quality: 100,
      targetWidth: 300,
      targetHeight: 290,
      correctOrientation: true
    };
  
    let actSheet = await this.actSheetController.create({
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
        text: "Remove Photo",
        icon: "trash",
        handler: () => {
          if(this.basic.profile_pic)
            this.createAlert("Remove Photo", "Are you sure you want to remove Profile Photo?", "Remove");
          else
            this.createAlert("Message", "No Profile Photo is set.", "Okay");
        }
      },
      {
        text: "Cancel",
        role: "cancel"
      }]
    });

    await actSheet.present();
  }

  async createAlert(head, msg, btn)
  {
    const alert = await this.alertController.create({
      header: head,
      message: msg,
      cssClass: "danger",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: btn,
          handler: () => {
            if(this.basic.profile_pic)
            {
              let url = "https://roshniindia.net/project1/api/data.php";
              this.load.showLoading();
              this.http.post(url, {mode: "update_profile", act: "del_profile_pic", pid: this.pid}).subscribe(response => {
                this.load.dismiss();
                this.ionViewDidEnter();
              }, err => {console.log(err);});
            }
          }
        }
      ]
    });

    alert.present();
  }

  async edit_profile(mode, index)
  {
    let title;
    let data;
    let act;

    if(mode == 1)
    {
      title = "Edit Basic Info";
      data = this.basic; act = "edit"
    }
    else if(mode == 2)
    { 
      title = "Edit Contact Info";
      data = this.basic;  act = "edit"
    }
    else if(mode == 3)
    {
      if(index == "add")
      { title = "Add Education";  act = "add"; }
      else
      { title = "Edit Education"; act = "edit"; data = this.edu[index]; } 
    }
    else if(mode == 4)
    {
      if(index == "add")
      { title = "Add Work";  act = "add"; }
      else
      { title = "Edit Work"; act = "edit"; data = this.work[index]; }
    }
      
    const modal = await this.modalController.create({component: ModalContentComponent, 
                                                    componentProps: {"title": title, "mode": mode, "act": act, "pid": this.pid, "data": data}, 
                                                    backdropDismiss: false});
    await modal.present();

    await modal.onDidDismiss().then((data)=>{
      this.ionViewDidEnter();
    })
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
        this.ionViewDidEnter();
      }, 
    err => {alert(JSON.stringify(err));});
  }

}
