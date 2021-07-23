import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';

const routes: Routes = [
    { path: '', redirectTo: '/home/tabs/profile', pathMatch: 'full' },
    {
        path: 'tabs',
        component: HomePage,
        children: [
            { path: '', redirectTo: '/home/tabs/profile:id', pathMatch: 'full' },
            {
                path: 'profile',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../profile/profile.module').then( m => m.ProfilePageModule)
                    },
                    {
                        path: 'edit-profile',
                        loadChildren: () => import('../profile/edit-profile/edit-profile.module').then(m => m.EditProfilePageModule)
                    }
                ]
            },
            {
                path: 'dashboard',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../dashboard/dashboard.module').then( m => m.DashboardPageModule)
                    }
                ]
            },
            {
                path: 'attendance',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../attendance/attendance.module').then( m => m.AttendancePageModule)
                    }
                ]
            },
            {
                path: 'stats',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../stats/stats.module').then( m => m.StatsPageModule)
                    }
                ]
            },
            {
                path: 'notice',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../notice/notice.module').then( m => m.NoticePageModule)
                    }
                ]
            },
            {
                path: 'home',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../admin-home/admin-home.module').then( m => m.AdminHomePageModule)
                    }
                ]
            },
            {
                path: 'push-notices',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../push-notices/push-notices.module').then( m => m.PushNoticesPageModule)
                    }
                ]
            }
        ]
    },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
