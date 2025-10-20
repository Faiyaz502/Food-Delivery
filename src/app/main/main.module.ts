import { NgModule } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { HomeComponent } from './home/home.component';
import { RestauranPageComponent } from './restauran-page/restauran-page.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../app-routing.module';
import { LeftSideBarComponent } from './left-side-bar/left-side-bar.component';
import { CartSideBarComponent } from './cart-side-bar/cart-side-bar.component';
import { CheckoutComponent } from './checkout/checkout.component';


@NgModule({
  declarations: [
    MainComponent,
    HomeComponent,
    RestauranPageComponent,
    LeftSideBarComponent,
    CartSideBarComponent,
    CheckoutComponent,


  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor

  ]
})
export class MainModule { }
