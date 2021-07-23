import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StudProfilePageRoutingModule } from './stud-profile-routing.module';

import { StudProfilePage } from './stud-profile.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    StudProfilePageRoutingModule
  ],
  declarations: [StudProfilePage]
})
export class StudProfilePageModule {}
