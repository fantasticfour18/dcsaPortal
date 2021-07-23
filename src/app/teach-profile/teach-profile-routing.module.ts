import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeachProfilePage } from './teach-profile.page';

const routes: Routes = [
  {
    path: '',
    component: TeachProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeachProfilePageRoutingModule {}
