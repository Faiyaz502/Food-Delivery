import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [

   { path: '', redirectTo: '/main', pathMatch: 'full' },

  { path: 'admin',component:AdminComponent,loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

   { path: 'analytics',component:AnalyticsComponent ,loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule) },

   { path: 'main',component:MainComponent,loadChildren: () => import('./main/main.module').then(m => m.MainModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
