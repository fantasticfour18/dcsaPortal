import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./faq/faq.module').then( m => m.FaqPageModule)
  },
  {
    path: 'user-verify',
    loadChildren: () => import('./login/user-verify/user-verify.module').then( m => m.UserVerifyPageModule)
  },
  {
    path: 'pass-reset',
    loadChildren: () => import('./login/pass-reset/pass-reset.module').then( m => m.PassResetPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'stud-profile',
    loadChildren: () => import('./stud-profile/stud-profile.module').then( m => m.StudProfilePageModule)
  },
  {
    path: 'teach-profile',
    loadChildren: () => import('./teach-profile/teach-profile.module').then( m => m.TeachProfilePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
