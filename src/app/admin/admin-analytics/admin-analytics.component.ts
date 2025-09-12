import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AnalyticsModule } from "src/app/analytics/analytics.module";
import { Order } from 'src/app/Models/order.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-admin-analytics',

  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.scss'],




})
export class AdminAnalyticsComponent {

///Total Order

 @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  constructor(private api: ApiService) {}

  ngOnInit() {
    Chart.register(...registerables);
    this.api.getOrders().subscribe(orders => this.createMonthlyChart(orders));
  }

  private createMonthlyChart(orders: Order[]) {
    // Initialize 12 months with 0
    const monthlyCounts = new Array(12).fill(0);
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const month = date.getMonth();
      monthlyCounts[month]++;
    });

    const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Gradient for bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(66, 165, 245, 0.8)');
    gradient.addColorStop(1, 'rgba(66, 165, 245, 0.3)');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthLabels,
        datasets: [{
          label: 'Orders Monthly Report',
          data: monthlyCounts,
          backgroundColor: gradient,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: { size: 14, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: 'Yearly Orders by Month',
            font: { size: 20, weight: 'bold' },
            padding: { top: 10, bottom: 30 }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { weight: 'bold', size: 14 },
            bodyFont: { size: 14 },
            padding: 10,
            cornerRadius: 6
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 12 } },
            grid: { color: 'rgba(400,400,400,0.5)' }
          },
          x: {
            ticks: { font: { size: 12 } },
            grid: { display: false }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart',
          onComplete: () => {
            // optional: do something after animation completes
          }
        }
      }
    });
  }

}
