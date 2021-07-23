import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoadingComponent } from '../loading/loading.component';
import { ModalController } from '@ionic/angular';
import { NoticeModalComponent } from '../notice-modal/notice-modal.component';

@Component({
  selector: 'app-stud-profile',
  templateUrl: './stud-profile.page.html',
  styleUrls: ['./stud-profile.page.scss'],
})
export class StudProfilePage {

  form; filter; filterBtn; list
  clss = ['MCA', 'MSc']; sems = ['I', 'II', 'III', 'IV', 'V'];

  constructor(private http: HttpClient, private modalController: ModalController, private load: LoadingComponent) 
  { 
    this.form = new FormGroup({clss: new FormControl(), sem: new FormControl(), 
    shift: new FormControl()});
  }

  ionViewDidEnter()
  {
    this.filter = true; this.filterBtn = false;
  }

  fetchData()
  {
    let url = "https://roshniindia.net/project1/api/data.php"
    let data = {mode: "viewUserList", utype: "Student", clss: this.form.get('clss').value, 
                sem: this.form.get('sem').value, shift: this.form.get('shift').value};

    this.load.showLoading();
    this.http.post(url, data).subscribe(response => {
      this.load.dismiss();
      this.list = response;
    }, err => {console.log(err);});
  }

  filterResults(action)
  {
    this.filter = true; this.filterBtn = false;

    if(action == 2)
    {
      this.filter = false;  this.filterBtn = true;
      this.fetchData();
    }
    else if(action == 'cancel')
    { this.filter = false;  this.filterBtn = true;  }
  }

  async showProfile(id)
  {
    const modal = this.modalController.create({component: NoticeModalComponent, componentProps: {mode: 2, id: this.list[id]['id']}, 
                  backdropDismiss: false});

    (await modal).present();
  }

}
