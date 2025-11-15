import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { UsersComponent } from './users/users.component';
import { RidersComponent } from './riders/riders.component';
import { CateringComponent } from './catering/catering.component';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { TestComponent } from './test/test.component';

import { AdminAnalyticsComponent } from './admin-analytics/admin-analytics.component';
import { CustomerComponent } from './customer/customer.component';
import { ReviewComponent } from './review/review.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { CouponComponent } from './coupon/coupon/coupon.component';
import { NotificationComponent } from './notification/notification.component';
import { LoginComponent } from './login/login.component';
import { PayrollComponent } from './payroll/payroll.component';


const routes: Routes = [
  { path: '', redirectTo: '/adminLogin', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'adminAnalytics', component: AdminAnalyticsComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'restaurant', component: RestaurantsComponent },
  { path: 'users', component: UsersComponent },
  { path: 'riders', component: RidersComponent },
  { path: 'catering', component: CateringComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'review', component: ReviewComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'coupon', component: CouponComponent },
  { path: 'notification', component: NotificationComponent },
    { path: 'payroll', component: PayrollComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
