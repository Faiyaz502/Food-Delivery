import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsComponent } from './analytics.component';
import { AdminChartComponent } from './admin-chart/admin-chart.component';


@NgModule({
  declarations: [
    AnalyticsComponent,
    AdminChartComponent
  ],
  imports: [
    CommonModule,
    AnalyticsRoutingModule
  ]
})
export class AnalyticsModule { }
