import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent {

  constructor(private loadController: LoadingController, private storage: Storage) {}

  async showLoading()
  {
      const load = await this.loadController.create({
      spinner: "crescent",
      message: "Please wait..."
    });

    await load.present();
  }

  dismiss()
  {
    this.loadController.dismiss();
  }
}
