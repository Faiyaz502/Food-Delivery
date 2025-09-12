import { CountUpModule } from 'ngx-countup';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UsersComponent } from './users/users.component';
import { RidersComponent } from './riders/riders.component';
import { CateringComponent } from './catering/catering.component';
import { FormsModule } from '@angular/forms';
import { TestComponent } from './test/test.component';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AdminAnalyticsComponent } from './admin-analytics/admin-analytics.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { HorizantalnavComponent } from './horizantalnav/horizantalnav.component';





@NgModule({
  declarations: [
    AdminComponent,
    DashboardComponent,
    OrdersComponent,
    RestaurantsComponent,
    SidebarComponent,
    UsersComponent,
    RidersComponent,
    CateringComponent,
    TestComponent,
    AdminAnalyticsComponent,
    HorizantalnavComponent



  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    AnalyticsModule  ,
    CountUpModule 

  ]
})
export class AdminModule {

 }
