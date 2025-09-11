import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AnalyticsComponent } from './analytics/analytics.component';

const routes: Routes = [

   { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'admin',component:AdminComponent,loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

   { path: 'analytics',component:AnalyticsComponent ,loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
