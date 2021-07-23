import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PushNoticesPage } from './push-notices.page';

const routes: Routes = [
  {
    path: '',
    component: PushNoticesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PushNoticesPageRoutingModule {}
