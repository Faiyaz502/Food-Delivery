import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CartResponseDTO } from 'src/app/Models/cart/cart.models';
import { OrderFilters, OrderResponseDTO, OrderStatistics, OrderStatus, PaymentStatus } from 'src/app/Models/Order/order.models';
import { CartService } from 'src/app/services/Cart/cart.service';

import {  OrderService } from 'src/app/services/Orders/order.service';
interface OrderStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
    private destroy$ = new Subject<void>();

  // Data
  orders: OrderResponseDTO[] = [];
  filteredOrders: OrderResponseDTO[] = [];
  carts: CartResponseDTO[] = [];
  selectedOrder: OrderResponseDTO | null = null;
  selectedCart: CartResponseDTO | null = null;
  stats: OrderStatistics = {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  };

  // UI State
  activeTab: 'orders' | 'carts' = 'orders';
  showOrderModal = false;
  showCartModal = false;
  showAdvancedFilters = false;
  loading = false;
  error: string | null = null;

  // Filters
  filters: OrderFilters = {
    status: undefined,
    paymentStatus: undefined,
    deliveryType: undefined,
    searchQuery: '',
    dateRange: 'ALL',
    priorityLevel: undefined,
    minAmount: undefined,
    maxAmount: undefined
  };

  // Enums for template
  orderStatuses: OrderStatus[] = [
    'PLACED', 'CONFIRMED', 'PREPARING',
    'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY',
    'DELIVERED', 'CANCELLED'
  ];

  paymentStatuses: PaymentStatus[] = [
    'PENDING', 'PAID', 'FAILED', 'REFUNDED'
  ];

  deliveryTypes = ['STANDARD', 'EXPRESS', 'SCHEDULED', 'PICKUP'];
  priorityLevels = [1, 2, 3, 4, 5];

  constructor(
    private orderService: OrderService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.subscribeToOrders();
    this.subscribeToStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // DATA LOADING
  // ============================================
  loadData(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getAllOrders(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Failed to load orders: ' + error.message;
          console.error('Error loading orders:', error);
        }
      });
  }

  subscribeToOrders(): void {
    this.orderService.orders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        this.orders = orders;
        this.applyFilters();
      });
  }

  subscribeToStats(): void {
    this.orderService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  loadCarts(): void {
    this.cartService.getAllActiveCarts().subscribe({
    next: (data) => {
      this.carts = data;
    },
    error: (err) => {
      console.error('Failed to load carts:', err);
    }
  }); 

  }

  // ============================================
  // FILTERING
  // ============================================
  applyFilters(): void {
    let filtered = [...this.orders];

    // Status filter
    if (this.filters.status) {
      filtered = filtered.filter(o => o.orderStatus === this.filters.status);
    }

    // Payment status filter
    if (this.filters.paymentStatus) {
      filtered = filtered.filter(o => o.paymentStatus === this.filters.paymentStatus);
    }

    // Delivery type filter
    if (this.filters.deliveryType) {
      filtered = filtered.filter(o => o.deliveryType === this.filters.deliveryType);
    }

    // Priority level filter
    if (this.filters.priorityLevel) {
      filtered = filtered.filter(o => o.priorityLevel === this.filters.priorityLevel);
    }

    // Search query
    if (this.filters.searchQuery) {
      const query = this.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.restaurantName.toLowerCase().includes(query) ||
        (o.customerPhone && o.customerPhone.includes(query))
      );
    }

    // Amount range
    if (this.filters.minAmount) {
      filtered = filtered.filter(o => o.totalAmount >= this.filters.minAmount!);
    }

    if (this.filters.maxAmount) {
      filtered = filtered.filter(o => o.totalAmount <= this.filters.maxAmount!);
    }

    // Date range
    const now = new Date();
    if (this.filters.dateRange === 'TODAY') {
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (this.filters.dateRange === 'WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.orderDate) >= weekAgo);
    } else if (this.filters.dateRange === 'MONTH') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.orderDate) >= monthAgo);
    }

    this.filteredOrders = filtered;
  }

  clearFilters(): void {
    this.filters = {
      status: undefined,
      paymentStatus: undefined,
      deliveryType: undefined,
      searchQuery: '',
      dateRange: 'ALL',
      priorityLevel: undefined,
      minAmount: undefined,
      maxAmount: undefined
    };
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // ============================================
  // ORDER OPERATIONS
  // ============================================
  viewOrderDetails(order: OrderResponseDTO): void {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  updateOrderStatus(orderId: number, status: OrderStatus): void {
    this.loading = true;
    this.orderService.updateOrderStatus(orderId, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.loading = false;
          this.selectedOrder = updatedOrder;
          // Success notification
          console.log('Order status updated successfully');
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Failed to update order status: ' + error.message;
          console.error('Error updating order status:', error);
        }
      });
  }

  cancelOrder(orderId: number, reason: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.loading = true;
      this.orderService.cancelOrder(orderId, reason)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (cancelledOrder) => {
            this.loading = false;
            this.selectedOrder = cancelledOrder;
            console.log('Order cancelled successfully');
          },
          error: (error) => {
            this.loading = false;
            this.error = 'Failed to cancel order: ' + error.message;
            console.error('Error cancelling order:', error);
          }
        });
    }
  }

  // ============================================
  // CART OPERATIONS
  // ============================================
  viewCartDetails(cart: CartResponseDTO): void {
    this.selectedCart = cart;
    this.showCartModal = true;
  }

  clearCart(userId: number): void {
    if (confirm('Are you sure you want to clear this cart?')) {
      this.cartService.clearCart(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showCartModal = false;
            this.loadCarts();
            console.log('Cart cleared successfully');
          },
          error: (error) => {
            this.error = 'Failed to clear cart: ' + error.message;
            console.error('Error clearing cart:', error);
          }
        });
    }
  }

  // ============================================
  // UI HELPERS
  // ============================================
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      PLACED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-purple-100 text-purple-800',
      PREPARING: 'bg-yellow-100 text-yellow-800',
      READY_FOR_PICKUP: 'bg-orange-100 text-orange-800',
      OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      PENDING: 'bg-gray-100 text-gray-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  formatCurrency(amount: number): string {
    return `৳${amount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTimeAgo(dateString: string): string {
    const now = new Date().getTime();
    const date = new Date(dateString).getTime();
    const minutes = Math.floor((now - date) / 60000);

    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  formatStatusText(status: string): string {
    return status.replace(/_/g, ' ');
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  closeCartModal(): void {
    this.showCartModal = false;
    this.selectedCart = null;
  }

  switchTab(tab: 'orders' | 'carts'): void {
    this.activeTab = tab;
    if (tab === 'carts' && this.carts.length === 0) {
      this.loadCarts();
    }
  }

  refreshData(): void {
    this.loadData();
    if (this.activeTab === 'carts') {
      this.loadCarts();
    }
  }

  exportOrders(): void {
    // Implement export functionality
    console.log('Exporting orders...');
  }

 
}
