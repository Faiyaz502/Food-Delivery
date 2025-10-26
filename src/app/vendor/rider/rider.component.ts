import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
  riderId: number = 15; // Get from auth service
  loading: boolean = false;
  error: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {


    this.orderService.getOrdersByRiderAndStatus(this.riderId,"CONFIRMED").subscribe((res)=>{

        this.incomingOrders = res ;
        console.log(res);


        this.order = this.incomingOrders[0];


        if (this.order.id) {
      this.loadOrder(this.order.id);
    }



    })




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

    // Validate OTP if required
    if (!this.deliveryOtp || this.deliveryOtp.length !== 4) {
      alert('Please enter a valid 4-digit OTP');
      return;
    }

    this.loading = true;
    this.orderService.updateOrderStatus(this.order.id, 'DELIVERED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.loading = false;
          alert('✅ Delivery completed successfully!\n\nOrder ' + updatedOrder.orderNumber + ' has been delivered.');
          // Navigate back to dashboard or orders list
          this.router.navigate(['/rider/dashboard']);
        },
        error: (err) => {
          this.error = 'Failed to complete delivery';
          this.loading = false;
          console.error('Error completing delivery:', err);
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

