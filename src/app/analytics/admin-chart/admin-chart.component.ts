import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-chart',
  templateUrl: './admin-chart.component.html',
  styleUrls: ['./admin-chart.component.scss']
})
export class AdminChartComponent {

   @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() type: ChartConfiguration['type'] = 'bar';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() label: string = 'Dataset';
  @Input() backgroundColor: string[] = [];

  chart!: Chart;

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.renderChart();
  }

  private renderChart() {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) this.chart.destroy(); // destroy previous chart

    this.chart = new Chart(ctx, {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: [{
          label: this.label,
          data: this.data,
          backgroundColor: this.backgroundColor.length ? this.backgroundColor : ['#42A5F5']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: this.label }
        },
        scales: { y: { beginAtZero: true } }
      } as any
    });
  }

}
