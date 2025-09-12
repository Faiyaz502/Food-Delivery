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


const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'adminAnalytics', component: AdminAnalyticsComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'restaurant', component: RestaurantsComponent },
  { path: 'users', component: UsersComponent },
  { path: 'riders', component: RidersComponent },
  { path: 'catering', component: CateringComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
