import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorRoutingModule } from './vendor-routing.module';
import { VendorComponent } from './vendor.component';
import { RiderComponent } from './rider/rider.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    VendorComponent,
    RiderComponent,
    RestaurantComponent
  ],
  imports: [
    CommonModule,
    VendorRoutingModule,
    FormsModule 

  ]
})
export class VendorModule { }
