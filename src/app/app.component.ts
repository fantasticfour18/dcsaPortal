import { Component } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { HomePage } from './home/home.page';
import { LoadingComponent } from './loading/loading.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  
  utype; status;  darkToggle;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private nav: NavController,
    private store: Storage,
    private oneSignal: OneSignal,
    private http: HttpClient,
    private load: LoadingComponent
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.store.get('data').then(data => {
      if(data)
      { this.utype = data.utype;  this.status = data.status;  }
    });

    this.store.get('pid').then(pid => {
      if(pid && this.status)
      {
        HomePage.pid = pid;
        this.push_init(pid);
        this.getbadgeCount(pid);
        if(this.utype == 'Non-Teaching-Staff')
          this.nav.navigateForward(['./home/tabs/home']);
        else
          this.nav.navigateForward(['./home/tabs/dashboard']);
      }
      else
        this.nav.navigateBack(['./login']); 
    });

    this.store.get('darkmode').then(dark => {
      if(dark)
        this.darkToggle = true;  
    });
  }

  logout()
  {
    if(this.store.keys())
    {
      this.store.clear();
      this.load.showLoading();
      this.http.post('https://roshniindia.net/project1/api/data.php', {mode: 'update_log_status', pid: HomePage.pid})
      .subscribe(response => { this.load.dismiss(); },
              err => {alert(JSON.stringify(err))
    });
      this.nav.navigateBack(['./login']);
    }
  }

  darkMode()
  {
    if(document.body.classList.toggle('dark'))
    { this.store.set('darkmode', true); }
    else
    { this.store.remove('darkmode');  }
  }
  
  push_init(pid)
  {
    this.oneSignal.startInit('1981731a-18e3-4605-b23c-d84657999b8d', '952908462627');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);
    
    this.oneSignal.handleNotificationReceived().subscribe(() => {
      this.getbadgeCount(pid);
    });

    this.oneSignal.handleNotificationOpened().subscribe(() => {
      this.nav.navigateForward(['./home/tabs/notice']);
    });

    this.oneSignal.endInit();

    this.oneSignal.getIds().then(ids => {this.save_device(pid, ids)});
  }

  save_device(pid, ids)
  {
    this.http.post('https://roshniindia.net/project1/api/data.php', {mode: 'push_notice', pid: pid, devId: ids.userId})
    .subscribe(response => {},
    err => {alert(JSON.stringify(err))
    });
  }

  getbadgeCount(pid)
  {
    this.http.post('https://roshniindia.net/project1/api/data.php', {mode: 'get_badge_count', pid: pid})
    .subscribe(response => {
      HomePage.badgeCount = parseInt(response + "");
    },
    err => {alert(JSON.stringify(err))
    });
  }
}
