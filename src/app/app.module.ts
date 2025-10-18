import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
        BrowserAnimationsModule,
    ToastrModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    CommonModule ,
    HttpClientModule,
    NgIf,
    NgFor,



  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
