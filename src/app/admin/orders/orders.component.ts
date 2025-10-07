import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Order, OrderFilters, OrderStatus, PaymentStatus } from 'src/app/Models/Order/order.models';

import { Rider } from 'src/app/Models/rider.model';
import { ApiService } from 'src/app/services/api.service';
import { OrderService } from 'src/app/services/Orders/order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
   orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 20;
  totalOrders = 0;

  filters: OrderFilters = {};
  searchTerm = '';
  selectedStatus: OrderStatus | '' = '';
  selectedPaymentStatus: PaymentStatus | '' = '';
  startDate = '';
  endDate = '';

  orderStatuses = Object.values(OrderStatus);
  paymentStatuses = Object.values(PaymentStatus);

  sortColumn: keyof Order = 'orderDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  selectedOrders: Set<string> = new Set();

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    const filters: OrderFilters = {
      ...this.filters,
      status: this.selectedStatus || undefined,
      paymentStatus: this.selectedPaymentStatus || undefined,
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
      searchTerm: this.searchTerm || undefined
    };

    this.orderService.getOrders(this.currentPage, this.pageSize, filters).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.totalOrders = response.total;
        this.applySort();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedPaymentStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.searchTerm = '';
    this.filters = {};
    this.loadOrders();
  }

 applySort(): void {
  if (!this.orders || !Array.isArray(this.orders) || this.orders.length === 0) return;

  this.orders.sort((a, b) => {
    const aValue = a[this.sortColumn];
    const bValue = b[this.sortColumn];

    if (aValue === undefined || bValue === undefined) return 0;

    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;

    return this.sortDirection === 'asc' ? comparison : -comparison;
  });
}


  getTotalPages(): number {
    return Math.ceil(this.totalOrders / this.pageSize);
  }

  sortBy(column: keyof Order): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalOrders) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  toggleOrderSelection(orderId: string): void {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
  }

  toggleAllOrders(): void {
    if (this.selectedOrders.size === this.orders.length) {
      this.selectedOrders.clear();
    } else {
      this.orders.forEach(order => this.selectedOrders.add(order.id));
    }
  }

  bulkUpdateStatus(status: OrderStatus): void {
    if (this.selectedOrders.size === 0) {
      alert('Please select orders to update');
      return;
    }

    if (confirm(`Update ${this.selectedOrders.size} orders to ${status}?`)) {
      const updates = Array.from(this.selectedOrders).map(orderId =>
        this.orderService.updateOrderStatus(orderId, status).toPromise()
      );

      Promise.all(updates).then(() => {
        this.selectedOrders.clear();
        this.loadOrders();
        alert('Orders updated successfully');
      }).catch(error => {
        console.error('Error updating orders:', error);
        alert('Error updating some orders');
      });
    }
  }

  deleteOrder(orderId: string): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
          alert('Order deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          alert('Error deleting order');
        }
      });
    }
  }

  exportOrders(): void {
    const csv = this.convertToCSV(this.orders);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(orders: Order[]): string {
    const headers = ['Order Number', 'Customer', 'Restaurant', 'Status', 'Payment Status', 'Total Amount', 'Order Date'];
    const rows = orders.map(order => [
      order.orderNumber,
      order.customerName,
      order.restaurantName,
      order.status,
      order.paymentStatus,
      order.totalAmount.toString(),
      order.orderDate
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  getStatusBadgeClass(status: OrderStatus): string {
    const statusClasses: { [key in OrderStatus]: string } = {
      [OrderStatus.PENDING]: 'status-pending',
      [OrderStatus.CONFIRMED]: 'status-confirmed',
      [OrderStatus.PREPARING]: 'status-preparing',
      [OrderStatus.OUT_FOR_DELIVERY]: 'status-delivery',
      [OrderStatus.DELIVERED]: 'status-delivered',
      [OrderStatus.CANCELLED]: 'status-cancelled',
      [OrderStatus.REFUNDED]: 'status-refunded'
    };
    return statusClasses[status];
  }

  formatCurrency(value: number): string {
    return `$${value.toFixed(2)}`;
  }
}
