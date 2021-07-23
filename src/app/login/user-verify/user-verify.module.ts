import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserVerifyPageRoutingModule } from './user-verify-routing.module';

import { UserVerifyPage } from './user-verify.page';
import { NgOtpInputModule } from 'ng-otp-input';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NgOtpInputModule,
    UserVerifyPageRoutingModule
  ],
  declarations: [UserVerifyPage]
})
export class UserVerifyPageModule {}
