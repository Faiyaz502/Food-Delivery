import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RestauranPageComponent } from './restauran-page/restauran-page.component';
import { MainComponent } from './main.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { TrackOrderComponent } from './track-order/track-order.component';
import { SupportComponent } from './support/support.component';
import { RestaurantListComponent } from './restaurant-list/restaurant-list.component';
import { LoginComponent } from './login/login.component';
import { OrderListComponent } from './order-list/order-list.component';
// ✅ Enable scroll position restoration
const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled', // scroll to top on navigation
  anchorScrolling: 'enabled'            // optional, for #anchor links
};
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'restaurant/:id', component: RestauranPageComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'trackOrder/:id', component: TrackOrderComponent },
  { path: 'support', component: SupportComponent },
  { path: 'restaurantList/:category', component: RestaurantListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'orderList', component: OrderListComponent },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
