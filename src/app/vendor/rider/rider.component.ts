import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { OrderResponseDTO, OrderStatus } from 'src/app/Models/Order/order.models';
import { OrderService } from 'src/app/services/Orders/order.service';

@Component({
  selector: 'app-rider',
  templateUrl: './rider.component.html',
  styleUrls: ['./rider.component.scss']
})
export class RiderComponent {
order: OrderResponseDTO | null = null;
incomingOrders:OrderResponseDTO[] |null = null ;
  currentPhase: 'pickup' | 'delivery' = 'pickup';
  deliveryOtp: string = '';
  riderId: number = environment.riderId; // Get from auth service
  loading: boolean = false;
  error: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {


forkJoin([
    this.orderService.getOrdersByRiderAndStatus(this.riderId, "PREPARING"),
    this.orderService.getOrdersByRiderAndStatus(this.riderId, "OUT_FOR_DELIVERY"),
    this.orderService.getOrdersByRiderAndStatus(this.riderId, "READY_FOR_PICKUP")
  ]).subscribe(([confirmed, outForDelivery, ready]) => {

    // Merge in order
    this.incomingOrders = [
      ...confirmed,
      ...outForDelivery,
      ...ready
    ];

    console.log(this.incomingOrders);

    if (this.incomingOrders.length > 0) {
      this.order = this.incomingOrders[0];
      this.loadOrder(this.order.id);
    }
  });




  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrder(orderId: number): void {
    this.loading = true;
    this.orderService.getOrderById(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {

          this.determinePhase(order.orderStatus);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load order details';
          this.loading = false;
          console.error('Error loading order:', err);
        }
      });
  }

  determinePhase(status: OrderStatus): void {
    if (status === 'OUT_FOR_DELIVERY') {
      this.currentPhase = 'delivery';
    } else {
      this.currentPhase = 'pickup';
    }
  }

  onArrivedAtRestaurant(): void {
    if (!this.order) return;
    alert('✓ Arrived at restaurant location!');
    // Optional: Update order status to indicate arrival
  }

  onPickupComplete(): void {
    if (!this.order) return;

    this.loading = true;
    this.orderService.updateOrderStatus(this.order.id, 'OUT_FOR_DELIVERY')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.currentPhase = 'delivery';
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to update pickup status';
          this.loading = false;
          console.error('Error updating pickup:', err);
        }
      });
  }

 onDeliveryComplete(): void {
  if (!this.order) return;

  // Validate OTP
  if (!this.deliveryOtp || this.deliveryOtp.length !== 4) {
    alert('Please enter a valid 4-digit OTP');
    return;
  }

  this.loading = true;

  this.orderService.confirmDelivery(this.order.id, this.deliveryOtp)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (responseMessage) => {
        this.loading = false;
        alert('✅ Delivery confirmed successfully!\n\n' + responseMessage);

        // Navigate back to dashboard or refresh
        this.ngOnInit();
      },
      error: (err) => {
        this.loading = false;
        alert('❌ ' + (err.error?.message || 'Invalid OTP or request failed'));
        console.error('OTP Verification Error:', err);
      }
    });
}
  callRestaurant(): void {
    // Implement call functionality - you'll need restaurant phone from backend
    alert('Calling restaurant...');
  }

  callCustomer(): void {
    if (this.order?.customerPhone) {
      window.location.href = `tel:${this.order.customerPhone}`;
    } else {
      alert('Customer phone number not available');
    }
  }

  openNavigation(): void {
    if (this.order?.deliveryLatitude && this.order?.deliveryLongitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.order.deliveryLatitude},${this.order.deliveryLongitude}`;
      window.open(url, '_blank');
    } else {
      alert('Location coordinates not available');
    }
  }

  getTotalItems(): number {
    if (!this.order?.orderItems) return 0;
    return this.order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getEstimatedTime(): string {
    return this.order?.estimatedDeliveryTime || '15-20 min';
  }
}

