import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';

@NgModule({
  imports: [
    CommonModule,
    HomePageRoutingModule,
    ReactiveFormsModule,
    IonicModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
