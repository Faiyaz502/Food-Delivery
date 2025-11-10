import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { JwtInterceptor } from './services/authService/jwt.interceptor';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { OAuthCallbackComponent } from './oauth-callback/oauth-callback.component';




@NgModule({
  declarations: [
    AppComponent,
    UnauthorizedComponent,
    OAuthCallbackComponent
  ],
  imports: [
        BrowserAnimationsModule,
    ToastrModule.forRoot({
      progressBar:true,
      closeButton:true,
      newestOnTop:true,
      positionClass:'toast-bottom-right',
      timeOut:7000
    }),
    BrowserModule,
    AppRoutingModule,
    CommonModule ,
    HttpClientModule,
    NgIf,
    NgFor,




  ],
  providers: [ { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
