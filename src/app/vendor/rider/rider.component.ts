import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { OrderResponseDTO, OrderStatus } from 'src/app/Models/Order/order.models';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { LocationUpdate, Rider } from 'src/app/Models/rider.model';
import { NotificationResponseDTO, NotificationService } from 'src/app/services/notificationAndcoupon/notification.service';
import { OrderService } from 'src/app/services/Orders/order.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { RiderService } from 'src/app/services/Rider/rider.service';
import { WebSocketService } from 'src/app/services/web-Socket/web-socket.service';

@Component({
  selector: 'app-rider',
  templateUrl: './rider.component.html',
  styleUrls: ['./rider.component.scss']
})
export class RiderComponent {
order: OrderResponseDTO | null = null;
orderRestaurant:Restaurant | null = null ;
incomingOrders:OrderResponseDTO[] |null = null ;
  currentPhase: 'pickup' | 'delivery' = 'pickup';
  deliveryOtp: string = '';
  riderId: number = environment.riderId; // Get from auth service
  loading: boolean = false;
  error: string = '';
    isOnline = false;
  isToggling = false;

  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private riderService:RiderService,
    private restaurantService:RestaurantService,
    private notificationService:NotificationService,
    private webSocket:WebSocketService
  ) {}

  ngOnInit(
  ): void {

      this.startLocationTracking();
      this.loadRiderStatus();
       this.loadNotifications();

      this.loadUnreadCount();


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

   this.ConncetWebSocket();


        this.webSocket.notificationReceived
    .pipe(takeUntil(this.destroy$))
    .subscribe(notification => {
      const exists = this.notifications.some(n => n.id === notification.id);
      if (!exists) {
        this.notifications.unshift(notification);
        this.unreadCount += 1;
      }
    });




  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

     this.stopLocationTracking();
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
           window.location.reload();
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


toastMessage: string | null = null;
private toastTimeout: any = null;

private showToast(message: string): void {
  // Clear previous toast
  if (this.toastTimeout) clearTimeout(this.toastTimeout);

  this.toastMessage = message;

  // Auto-hide after 4 seconds
  this.toastTimeout = setTimeout(() => {
    this.toastMessage = null;
  }, 4000);
}

openNavigation(): void {
  let destinationLat: number | undefined = undefined;
  let destinationLng: number | undefined = undefined;
  let destinationName = '';

  if (this.order?.orderStatus === 'OUT_FOR_DELIVERY') {
    destinationLat = this.order.deliveryLatitude;
    destinationLng = this.order.deliveryLongitude;
    destinationName = 'Customer';
  } else {
    const restaurant = this.orderRestaurant
    if (restaurant?.latitude != null && restaurant?.longitude != null) {
      destinationLat = restaurant.latitude;
      destinationLng = restaurant.longitude;
      destinationName = restaurant.name || 'Restaurant';
    }
  }

  // 🔥 CRITICAL: Check that both are REAL NUMBERS
  if (
    destinationLat == null ||
    destinationLng == null ||
    isNaN(destinationLat) ||
    isNaN(destinationLng)
  ) {
    this.showToast(`Location not available for ${destinationName.toLowerCase()}.`);
    return;
  }

  // ✅ Now safe to use in URL
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}&travelmode=driving`;

  const newWindow = window.open(url, '_blank');
  if (!newWindow) {
    this.showToast('Popup blocked. Please allow popups to open navigation.');
  }
}

  getTotalItems(): number {
    if (!this.order?.orderItems) return 0;
    return this.order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getEstimatedTime(): string {
    return this.order?.estimatedDeliveryTime || '15-20 min';
  }


  //Rider location Track

   showLocationPermissionBanner = false;
  private locationWatchId: number | null = null;
  private locationSendSubscription: Subscription | null = null;

  // ================================
  // LOCATION TRACKING LOGIC
  // ================================

  private startLocationTracking(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    // First, get current position to verify permission
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // ✅ Permission granted — send initial location and start watching
        this.sendLocationToServer(position.coords.latitude, position.coords.longitude);
        this.startWatchingLocation();
      },
      (error) => {
        this.handleGeolocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }

  private startWatchingLocation(): void {
    if (this.locationWatchId !== null) return;

    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        this.sendLocationToServer(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn('Location watch error:', error);
        // Optional: retry or show banner
      },
      {
        enableHighAccuracy: true,   // Use GPS if available
        timeout: 10000,             // Wait max 10s for position
        maximumAge: 5000            // Accept cached position up to 5s old
        // Note: Browser controls actual frequency (typically every 5-30s)
      }
    );
  }

private sendLocationToServer(lat: number, lng: number): void {
  if (!this.riderId) return;

  const locationUpdate: LocationUpdate = { latitude: lat, longitude: lng };

  this.riderService.updateRiderLocation(this.riderId, locationUpdate).pipe(
    catchError(error => {
      console.warn('Location send failed (safe to ignore):', error.status, error.message);

      return of(null); // 👈 Silent failure — no UX disruption
    })
  ).subscribe();
}

  private stopLocationTracking(): void {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }

    if (this.locationSendSubscription) {
      this.locationSendSubscription.unsubscribe();
      this.locationSendSubscription = null;
    }
  }

  private handleGeolocationError(error: GeolocationPositionError): void {
    console.error('Geolocation error:', error);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.showLocationPermissionBanner = true;
        break;
      case error.POSITION_UNAVAILABLE:
        console.warn('Location information is unavailable.');
        break;
      case error.TIMEOUT:
        console.warn('The request to get user location timed out.');
        break;
      default:
        console.warn('An unknown error occurred.');
        break;
    }
  }


  //toggle offline/online

    private loadRiderStatus(): void {

      this.riderService.getRiderById(this.riderId).subscribe((res)=>{

         const status = res.availabilityStatus;

         if(status == "AVAILABLE"){this.isOnline = true}
         if(status == "OFFLINE"){this.isOnline = false}



      })

   // or false — adjust based on your logic
  }

  toggleStatus(): void {
    if (this.isToggling) return; // prevent double-click

    this.isToggling = true;

    const toggle$ = this.isOnline
      ? this.riderService.goOffline(this.riderId)
      : this.riderService.goOnline(this.riderId);

    toggle$.subscribe({
      next: (updatedRider: Rider) => {
        this.isOnline = !this.isOnline;
        this.isToggling = false;
        // Optional: show success toast
        // this.showToast(`You are now ${this.isOnline ? 'online' : 'offline'}`);
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.isToggling = false;
        // Show error toast
        // this.showToast('Failed to update status. Please try again.');
      }
    });
  }


  //Notifications


  notifications: NotificationResponseDTO[] = [];
  unreadCount = 0;
  loadingN = false;
    showNotificationsPanel = false;

    loadNotifications(): void {
      this.loadingN = true;
      this.notificationService.getUserNotifications(this.riderId).subscribe({
        next: (res) => {
          this.notifications = res.content || res;
          this.loadingN = false;
        },
        error: (err) => {
          console.error('Failed to fetch notifications:', err);
          this.loadingN = false;
        }
      });
    }


  // ✅ No manual count updates!
  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.riderId).subscribe();
  }

    loadUnreadCount(): void {
      this.notificationService.getUnreadCount(this.riderId).subscribe({
        next: (count) => (this.unreadCount = count),
        error: (err) => console.error('Failed to load unread count:', err)
      });
    }




  formatTimeAgo(isoDate: string): string {
      const date = new Date(isoDate);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + 'y';

      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + 'mo';

      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + 'd';

      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + 'h';

      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + 'm';

      return Math.floor(seconds) + 's';
    }



    // ✅ Fix: Separate click handler with stopPropagation
    toggleNotifications(event: MouseEvent): void {
      event.stopPropagation();
      this.showNotificationsPanel = !this.showNotificationsPanel;

      if (this.showNotificationsPanel) {
        this.markAllAsRead();
        this.unreadCount=0;
          this.loadNotifications();
      }
    }

     @HostListener('document:click', ['$event'])
      onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;



        // Close Notification Panel
        const bell = document.querySelector('.notification-bell');
        const panel = document.querySelector('.notification-panel');

        if (
          this.showNotificationsPanel &&
          bell &&
          panel &&
          !bell.contains(target) &&
          !panel.contains(target)
        ) {
          this.showNotificationsPanel = false;
        }
      }

      //webSocket

      async ConncetWebSocket() {
 await this.webSocket.connect(this.riderId);


}




}







