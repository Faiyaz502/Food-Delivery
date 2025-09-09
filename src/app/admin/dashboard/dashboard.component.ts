import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'src/app/Models/menu-item.model';
import { Order } from 'src/app/Models/order.model';
import { Payment } from 'src/app/Models/payment.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { Rider } from 'src/app/Models/rider.model';
import { User } from 'src/app/Models/user.model';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent  {

   payments: Payment[] = [];
  riders: Rider[] = [];
  orders: Order[] = [];
  totalRevenue = 0;
  availableRiders = 0;
  totalRiders = 0;
  availableRidersList: Rider[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.apiService.getPayments().subscribe(payments => {
      this.payments = payments;
      this.totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    });

    this.apiService.getRiders().subscribe(riders => {
      this.riders = riders;
      this.totalRiders = riders.length;
      this.availableRiders = riders.filter(rider => rider.availability).length;
      this.availableRidersList = riders.filter(rider => rider.availability);
    });

    this.apiService.getOrders().subscribe(orders => {
      this.orders = orders;
    });
  }





}


