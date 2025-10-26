import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorComponent } from './vendor.component';
import { RiderComponent } from './rider/rider.component';
import { RestaurantComponent } from './restaurant/restaurant.component';

const routes: Routes = [
  { path: '', component: RestaurantComponent },
  { path: 'rider', component: RiderComponent },
  { path: 'restaurantVendor', component: RestaurantComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorRoutingModule { }
