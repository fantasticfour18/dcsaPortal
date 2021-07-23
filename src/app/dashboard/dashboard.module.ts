import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';

import { ChartsModule } from 'ng2-charts-x';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Angular2UsefulSwiperModule } from 'angular2-useful-swiper';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ChartsModule,
    DashboardPageRoutingModule,
    MatDatepickerModule, MatCardModule, MatIconModule,
    Angular2UsefulSwiperModule, NgCircleProgressModule.forRoot()
  ],
  declarations: [DashboardPage]
})
export class DashboardPageModule {}
