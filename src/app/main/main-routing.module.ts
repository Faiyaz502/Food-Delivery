import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { HomeComponent } from './home/home.component';
import { RestauranPageComponent } from './restauran-page/restauran-page.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'home', component: HomeComponent },
  { path: 'restaurant/:id', component: RestauranPageComponent }



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
