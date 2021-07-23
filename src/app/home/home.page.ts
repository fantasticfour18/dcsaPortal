import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  userType; static badgeCount; static pid;

  constructor(private store: Storage){}

  ngOnInit()
  {
    this.store.get('data').then(data => {
      if(data.utype)
        this.userType = data.utype;
    });
  }

  get staticBadgeCount()
  {
    return HomePage.badgeCount;
  }

  static refresh()
  {
    
  }
  
}
