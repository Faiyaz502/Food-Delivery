import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent {

   restaurantLabels: string[] = [];
  restaurantSales: number[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSalesData();
  }

  loadSalesData() {
    this.http.get<any[]>('http://localhost:3000/orders').subscribe(orders => {
      const totals: { [restaurantId: string]: number } = {};
      orders.forEach(order => {
        console.log("hello");

        const restaurantId = order.restaurant_id || 'Unknown';
        totals[restaurantId] = (totals[restaurantId] || 0) + order.total_amount;
      });

      this.restaurantLabels = Object.keys(totals);
      this.restaurantSales = Object.values(totals);
    });
  }

}
