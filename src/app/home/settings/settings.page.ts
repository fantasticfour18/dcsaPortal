import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {SettingsModComponent} from '../settings-mod/settings-mod.component';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  data;

  constructor(private modalController: ModalController, private store: Storage) { }

  ngOnInit() {}

  ionViewDidEnter()
  {
    this.store.get("data").then(data => {
      this.data = data;
      console.log(data);
    });
  }

  async edit(mode)
  {
    const modal = await this.modalController.create({
      component: SettingsModComponent, componentProps: {mode: mode, data: this.data}, backdropDismiss: false
    });

    await modal.present();

    await modal.onWillDismiss().then((data) => {
      if(data != null)
        this.ionViewDidEnter();
    });

  }

}
