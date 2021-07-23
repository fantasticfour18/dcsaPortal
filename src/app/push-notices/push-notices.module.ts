import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PushNoticesPageRoutingModule } from './push-notices-routing.module';

import { PushNoticesPage } from './push-notices.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    PushNoticesPageRoutingModule
  ],
  declarations: [PushNoticesPage]
})
export class PushNoticesPageModule {}
