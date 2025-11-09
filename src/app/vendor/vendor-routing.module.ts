import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorComponent } from './vendor.component';
import { RiderComponent } from './rider/rider.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { RoleGuard } from '../services/authService/role.guard';
import { VendorLoginComponent } from './Login/vendor-login/vendor-login.component';


const routes: Routes = [
  { path: '', component: VendorLoginComponent },
   {
    path: 'rider',
    component: RiderComponent,
    canActivate: [RoleGuard],
    data: { roles: ['DELIVERY_PERSON'] }
  },
  {
    path: 'restaurantVendor',
    component: RestaurantComponent,
    canActivate: [RoleGuard],
    data: { roles: ['RESTAURANT_OWNER'] }
    
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorRoutingModule { }
