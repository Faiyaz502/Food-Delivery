
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestComponent } from './test/test.component';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AdminAnalyticsComponent } from './admin-analytics/admin-analytics.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { HorizantalnavComponent } from './horizantalnav/horizantalnav.component';
import { CustomerComponent } from './customer/customer.component';
import { ReviewComponent } from './review/review.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { DialogComponent } from './riders/dialog/dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { CouponComponent } from './coupon/coupon/coupon.component';
import { NotificationComponent } from './notification/notification.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LoginComponent } from './login/login.component';
import { PayrollComponent } from './payroll/payroll.component';
import { A11yModule } from "@angular/cdk/a11y";
import { PaymentsComponent } from './payments/payments.component';





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
    HorizantalnavComponent,
    CustomerComponent,
    ReviewComponent,
    ChatComponent,
    ProfileComponent,
    DialogComponent,
    CouponComponent,
    NotificationComponent,
    LoginComponent,
    PayrollComponent,
    PaymentsComponent,




  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    AnalyticsModule,
    ReactiveFormsModule,
    DragDropModule,
    ToastrModule,
    MatDialogModule,
    NgApexchartsModule,
    A11yModule
]
})
export class AdminModule {

 }
