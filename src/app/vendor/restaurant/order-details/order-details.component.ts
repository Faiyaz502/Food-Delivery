import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

import { environment } from 'src/app/Envirment/environment';
import { OrderResponseDTO } from 'src/app/Models/Order/order.models';
import { OrderService } from 'src/app/services/Orders/order.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent {

 @Input() isOpen: boolean = false;
  @Input() restaurantId!: number;

  orders: OrderResponseDTO[] = [];
  selectedOrder: OrderResponseDTO | null = null;
  showOrderModal : Boolean = false;

  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

    ngOnChanges(changes: SimpleChanges) {
    if (changes['restaurantId'] && this.restaurantId) {
      this.loadOrders(); // reload orders whenever restaurant changes
    }
  }

  closeOrderModal() {
  this.showOrderModal = false;
  this.selectedOrder = null;
}


  loadOrders(page: number = 0) {
    this.orderService.getOrdersByRestaurant(this.restaurantId, page, this.pageSize).subscribe({
      next: (response: any) => {
        this.orders = response.content || response;
        this.totalPages = response.totalPages || 1;
        this.totalElements = response.totalElements || this.orders.length;
        this.currentPage = response.number || page;

        console.log(response);

      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.loadOrders(page);
    }
  }


  closeDetails() {
    this.selectedOrder = null;
  }

  close() {
    this.isOpen = false;
  }

  viewOrderDetails(order: any) {
  console.log('View clicked for order:', order);
  this.selectedOrder = order;   // store the clicked order
  this.showOrderModal = true;   // open the modal
}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return `৳${amount.toFixed(2)}`;
  }

  formatStatusText(status: string): string {
    return status.replace(/_/g, ' ').toUpperCase();
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

}
