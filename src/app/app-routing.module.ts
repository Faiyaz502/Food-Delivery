import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { MainComponent } from './main/main.component';
import { VendorComponent } from './vendor/vendor.component';
import { LoginComponent } from './admin/login/login.component';
import { AuthGuard } from './services/authService/auth.guard';
import { RoleGuard } from './services/authService/role.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

const routes: Routes = [

   { path: '', redirectTo: '/admin', pathMatch: 'full' },
   {path: 'adminLogin', component:LoginComponent},
     { path: 'unauthorized', component: UnauthorizedComponent },

  { path: 'admin'
    ,component:AdminComponent,
        canLoad: [AuthGuard, RoleGuard],
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] , loginUrl: '/adminLogin'},
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

   { path: 'analytics',component:AnalyticsComponent ,loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule) },

   { path: 'main',component:MainComponent,loadChildren: () => import('./main/main.module').then(m => m.MainModule) },

   { path: 'vendor', component:VendorComponent,loadChildren: () => import('./vendor/vendor.module').then(m => m.VendorModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
