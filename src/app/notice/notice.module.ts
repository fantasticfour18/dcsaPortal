import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatePipe } from '@angular/common';

import { NoticePageRoutingModule } from './notice-routing.module';

import { NoticePage } from './notice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoticePageRoutingModule
  ],
  declarations: [NoticePage],
  providers: [DatePipe]
})
export class NoticePageModule {}
