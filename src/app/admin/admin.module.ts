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
    TestComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,

  ]
})
export class AdminModule {

 }
