import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';

import { ModalContentComponent } from './modal-content/modal-content.component';
import { SettingsModComponent } from './home/settings-mod/settings-mod.component';
import { LoadingComponent } from './loading/loading.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CalHeader } from './dashboard/dashboard.page'

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { NoticeModalComponent } from './notice-modal/notice-modal.component';

@NgModule({
  declarations: [AppComponent, ModalContentComponent, SettingsModComponent, NoticeModalComponent, CalHeader],
  entryComponents: [ModalContentComponent, SettingsModComponent, NoticeModalComponent, CalHeader],
  imports: [BrowserModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule, ReactiveFormsModule, HttpClientModule,
  NgOtpInputModule, MatDatepickerModule, MatNativeDateModule, MatMomentDateModule, MatCardModule, MatIconModule, 
  BrowserAnimationsModule],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    File, FileTransfer, FileTransferObject, FileOpener,
    LoadingComponent, OneSignal,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
  
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
