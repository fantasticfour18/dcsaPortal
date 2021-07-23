import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeachProfilePageRoutingModule } from './teach-profile-routing.module';

import { TeachProfilePage } from './teach-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeachProfilePageRoutingModule
  ],
  declarations: [TeachProfilePage]
})
export class TeachProfilePageModule {}
