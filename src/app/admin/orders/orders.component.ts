import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Order } from 'src/app/Models/order.model';
import { Rider } from 'src/app/Models/rider.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  // Data properties
  orders: Order[] = [];
  riders: Rider[] = [];
  availableRiders: Rider[] = [];
  selectedOrder: Order | null = null;

  // UI state
  showAssignRiderModal = false;
  loading = false;
  error: string | null = null;

  // Statistics
  pendingOrders = 0;
  inTransitOrders = 0;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadRiders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load orders from the API
   */
  loadOrders(): void {
    this.loading = true;
    this.apiService.getOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          this.calculateStatistics();
          this.loading = false;
          console.log('Orders loaded:', this.orders);
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.error = 'Failed to load orders. Please try again.';
          this.loading = false;
        }
      });
  }

  /**
   * Load riders from the API
   */
  loadRiders(): void {
    this.apiService.getRiders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (riders) => {
          this.riders = riders;
          this.availableRiders = riders.filter(rider => rider.availability);
          console.log('Riders loaded:', this.riders);
          console.log('Available riders:', this.availableRiders);
        },
        error: (error) => {
          console.error('Error loading riders:', error);
        }
      });
  }

  /**
   * Calculate order statistics
   */
  private calculateStatistics(): void {
    const pendingStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
    this.pendingOrders = this.orders.filter(order =>
      pendingStatuses.includes(order.status)
    ).length;

    this.inTransitOrders = this.orders.filter(order =>
      order.status === 'in_transit'
    ).length;
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: number, event: any): void {
    const newStatus = event.target.value;

    this.apiService.updateOrderStatus(orderId, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log(`Order ${orderId} status updated to ${newStatus}`);
          this.loadOrders(); // Refresh orders to get updated data

          // Show success notification (you can implement a toast service)
          this.showNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          this.showNotification('Failed to update order status', 'error');

          // Revert the select value on error
          this.loadOrders();
        }
      });
  }

  /**
   * Show rider assignment modal
   */
  showRiderAssignment(order: Order): void {
    this.selectedOrder = order;
    this.showAssignRiderModal = true;

    // Refresh available riders when opening modal
    this.loadRiders();
  }

  /**
   * Assign rider to order
   */
  assignRider(rider: Rider): void {
    if (!this.selectedOrder) {
      console.error('No order selected for rider assignment');
      return;
    }

    const orderId = this.selectedOrder.id;
    const riderId = rider.id;

    console.log(`Assigning rider ${riderId} to order ${orderId}`);

    // First update the order status to in_transit
    this.apiService.updateOrderStatus(orderId, 'in_transit')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Then update rider availability
          this.apiService.updateRiderAvailability(riderId, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                console.log(`Rider ${riderId} assigned successfully`);

                // Refresh data
                this.loadOrders();
                this.loadRiders();

                // Close modal
                this.closeAssignRiderModal();

                // Show success notification
                this.showNotification(
                  `Rider #${riderId} assigned to Order #${orderId}`,
                  'success'
                );

                // In a real application, you might also want to:
                // 1. Create a delivery record in the database
                // 2. Send notifications to the rider and customer
                // 3. Start tracking the delivery
                this.createDeliveryRecord(orderId, riderId);
              },
              error: (error) => {
                console.error('Error updating rider availability:', error);
                this.showNotification('Failed to assign rider', 'error');
              }
            });
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          this.showNotification('Failed to update order status', 'error');
        }
      });
  }

  /**
   * Create delivery record (placeholder for actual implementation)
   */
  private createDeliveryRecord(orderId: number, riderId: number): void {
    const deliveryData = {
      order_id: orderId,
      rider_id: riderId,
      status: 'assigned',
      assigned_at: new Date().toISOString(),
      estimated_delivery: this.calculateEstimatedDelivery()
    };

    // This would typically call your API to create a delivery record
    console.log('Creating delivery record:', deliveryData);

    // Uncomment when you have the API endpoint ready
    // this.apiService.createDelivery(deliveryData).subscribe({
    //   next: (delivery) => console.log('Delivery record created:', delivery),
    //   error: (error) => console.error('Error creating delivery record:', error)
    // });
  }

  /**
   * Calculate estimated delivery time (30-45 minutes from now)
   */
  private calculateEstimatedDelivery(): string {
    const now = new Date();
    const estimatedMinutes = Math.floor(Math.random() * 15) + 30; // 30-45 minutes
    const estimatedTime = new Date(now.getTime() + estimatedMinutes * 60000);
    return estimatedTime.toISOString();
  }

  /**
   * Close rider assignment modal
   */
  closeAssignRiderModal(): void {
    this.showAssignRiderModal = false;
    this.selectedOrder = null;
  }

  /**
   * Get CSS classes for payment status badges
   */
  getPaymentStatusClass(status: string): string {
    if (!status) return 'bg-gray-100/20 text-gray-300 border border-gray-500/30';

    const statusLower = status.toLowerCase();
    const statusClasses: { [key: string]: string } = {
      'paid': 'bg-gradient-to-r from-emerald-400/20 to-green-500/20 text-emerald-300 border border-emerald-400/30',
      'pending': 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-300 border border-yellow-400/30',
      'failed': 'bg-gradient-to-r from-red-400/20 to-pink-500/20 text-red-300 border border-red-400/30',
      'refunded': 'bg-gradient-to-r from-blue-400/20 to-cyan-500/20 text-blue-300 border border-blue-400/30',
      'processing': 'bg-gradient-to-r from-purple-400/20 to-indigo-500/20 text-purple-300 border border-purple-400/30',
      'cancelled': 'bg-gradient-to-r from-orange-400/20 to-red-500/20 text-orange-300 border border-orange-400/30'
    };

    // Find matching status or return default
    for (const key in statusClasses) {
      if (statusLower.includes(key)) {
        return statusClasses[key];
      }
    }

    return 'bg-gradient-to-r from-indigo-400/20 to-purple-500/20 text-indigo-300 border border-indigo-400/30';
  }

  /**
   * Get CSS classes for order status badges
   */
  getOrderStatusClass(status: string): string {
    if (!status) return 'bg-gray-100/20 text-gray-300';

    const statusLower = status.toLowerCase();
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-gradient-to-r from-yellow-400/20 to-amber-500/20 text-yellow-300 border border-yellow-400/30',
      'confirmed': 'bg-gradient-to-r from-blue-400/20 to-cyan-500/20 text-blue-300 border border-blue-400/30',
      'preparing': 'bg-gradient-to-r from-orange-400/20 to-red-500/20 text-orange-300 border border-orange-400/30',
      'ready': 'bg-gradient-to-r from-purple-400/20 to-indigo-500/20 text-purple-300 border border-purple-400/30',
      'in_transit': 'bg-gradient-to-r from-emerald-400/20 to-teal-500/20 text-emerald-300 border border-emerald-400/30',
      'delivered': 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-green-300 border border-green-500/30',
      'cancelled': 'bg-gradient-to-r from-red-500/20 to-rose-600/20 text-red-300 border border-red-500/30'
    };

    return statusClasses[statusLower] || 'bg-gradient-to-r from-gray-400/20 to-slate-500/20 text-gray-300 border border-gray-400/30';
  }

  /**
   * Show notification (placeholder - implement with a toast service)
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    console.log(`${type.toUpperCase()}: ${message}`);

    // In a real application, you would use a toast/notification service
    // Example with a simple implementation:
    // this.notificationService.show(message, type);

    // Or you could show a temporary alert
    if (type === 'error') {
      alert(`Error: ${message}`);
    }
  }

  /**
   * View order details
   */
  viewOrderDetails(order: Order): void {
    console.log('Viewing order details:', order);
    // Implement navigation to order details page or show modal
    // this.router.navigate(['/orders', order.id]);
  }

  /**
   * Export orders to CSV
   */
  exportOrders(): void {
    if (!this.orders.length) {
      this.showNotification('No orders to export', 'info');
      return;
    }

    const headers = [
      'Order ID',
      'User ID',
      'Amount',
      'Status',
      'Payment Status',
      'Created At'
    ];

    const csvData = this.orders.map(order => [
      order.id,
      order.user_id,
      order.total_amount,
      order.status,
      order.payment_status,
      order.created_at
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell =>
        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(','))
    ].join('\n');

    this.downloadCSV(csvContent, 'orders');
  }

  /**
   * Download CSV file
   */
  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showNotification('Orders exported successfully', 'success');
    }
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    this.loadOrders();
    this.loadRiders();
  }

  /**
   * Handle order search (if you want to add search functionality)
   */
  searchOrders(searchTerm: string): void {
    console.log('Searching orders:', searchTerm);
    // Implement search functionality
    // You could filter the orders array based on the search term
  }

  /**
   * Get rider info by ID (helper method)
   */
  getRiderById(riderId: number): Rider | undefined {
    return this.riders.find(rider => rider.id === riderId);
  }

  /**
   * Get order priority based on creation time and status
   */
  getOrderPriority(order: Order): 'high' | 'medium' | 'low' {
    const hoursSinceCreation = (new Date().getTime() - new Date(order.created_at).getTime()) / (1000 * 60 * 60);

    if (order.status === 'pending' && hoursSinceCreation > 2) {
      return 'high';
    } else if (order.status === 'ready' && hoursSinceCreation > 1) {
      return 'high';
    } else if (order.status === 'preparing' && hoursSinceCreation > 3) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Calculate total revenue from orders
   */
  getTotalRevenue(): number {
    return this.orders
      .filter(order => ['delivered', 'in_transit'].includes(order.status))
      .reduce((total, order) => total + order.total_amount, 0);
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: string): Order[] {
    return this.orders.filter(order => order.status === status);
  }

  /**
   * Get today's orders
   */
  getTodaysOrders(): Order[] {
    const today = new Date().toDateString();
    return this.orders.filter(order =>
      new Date(order.created_at).toDateString() === today
    );
  }
}
