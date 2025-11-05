import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorRoutingModule } from './vendor-routing.module';
import { VendorComponent } from './vendor.component';
import { RiderComponent } from './rider/rider.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderDetailsComponent } from './restaurant/order-details/order-details.component';
import { VendorLoginComponent } from './Login/vendor-login/vendor-login.component';



@NgModule({
  declarations: [
    VendorComponent,
    RiderComponent,
    RestaurantComponent,
    OrderDetailsComponent,
    VendorLoginComponent,

  ],
  imports: [
    CommonModule,
    VendorRoutingModule,
    FormsModule ,
    ReactiveFormsModule

  ]
})
export class VendorModule { }
