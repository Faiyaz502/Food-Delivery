import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RestauranPageComponent } from './restauran-page/restauran-page.component';
import { MainComponent } from './main.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { TrackOrderComponent } from './track-order/track-order.component';
import { SupportComponent } from './support/support.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'restaurant', component: RestauranPageComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'trackOrder', component: TrackOrderComponent },
  { path: 'support', component: SupportComponent },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
