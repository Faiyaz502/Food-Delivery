import { Component, HostListener, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, forkJoin, of, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { OrderResponseDTO, OrderStatus } from 'src/app/Models/Order/order.models';
import { RiderShiftSummary } from 'src/app/Models/payroll/riderShift.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { LocationUpdate, Rider } from 'src/app/Models/rider.model';
import { AuthServiceService } from 'src/app/services/authService/auth-service.service';
import { TokenService } from 'src/app/services/authService/token.service';
import { NotificationResponseDTO, NotificationService } from 'src/app/services/notificationAndcoupon/notification.service';
import { OrderService } from 'src/app/services/Orders/order.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { RiderShiftService } from 'src/app/services/rider-shift.service';
import { RiderService } from 'src/app/services/Rider/rider.service';
import { WebSocketService } from 'src/app/services/web-Socket/web-socket.service';

@Component({
  selector: 'app-rider',
  templateUrl: './rider.component.html',
  styleUrls: ['./rider.component.scss']
})
export class RiderComponent {
  order: OrderResponseDTO | null = null;
  orderRestaurant: Restaurant | null = null;
  incomingOrders: OrderResponseDTO[] = []; // ✅ initialize as empty array
  currentPhase: 'pickup' | 'delivery' = 'pickup';
  deliveryOtp: string = '';
  riderId: any;
  loading: boolean = false;
  error: string = '';
  isOnline = false;
  isToggling = false;
  shift: RiderShiftSummary | null = null;
  rider!:Rider;

  private destroy$ = new Subject<void>();

  // Notifications
  notifications: NotificationResponseDTO[] = [];
  unreadCount = 0;
  loadingN = false;
  showNotificationsPanel = false;

  // Location
  showLocationPermissionBanner = false;
  private locationWatchId: number | null = null;
  private locationSendSubscription: Subscription | null = null;
  toastMessage: string | null = null;
  private toastTimeout: any = null;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private riderService: RiderService,
    private restaurantService: RestaurantService,
    private notificationService: NotificationService,
    private webSocket: WebSocketService,
    private token: TokenService,
    private auth: AuthServiceService,
    private toast: ToastrService,
    private shiftService: RiderShiftService,
    private zone: NgZone // ✅ for safe UI updates
  ) {}

  ngOnInit(): void {
    this.riderId = Number(this.token.getId());
    this.startLocationTracking();
    this.loadRiderStatus();
    this.loadNotifications();
    this.loadUnreadCount();
    this.loadRider();
    this.fetchIncomingOrders(); // ✅ centralize order fetching

    this.ConncetWebSocket();

    this.webSocket.notificationReceived
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        // ✅ Handle new order assignment via WebSocket
  if (notification.type === 'ORDER' && notification.orderId) {
  this.zone.run(() => {
    this.orderService.getOrderById(notification.orderId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.selectOrder(order);
          this.toast.success(`New order assigned: #${order.orderNumber}`, 'New Order', {
            timeOut: 5000
          });
        },
        error: (err) => {
          console.error('Failed to load assigned order:', err);
          this.toast.error('Failed to load new order. Please refresh.');
        }
      });
  });
}

        // Add to notifications list
        const exists = this.notifications.some(n => n.id === notification.id);
        if (!exists) {
          this.notifications.unshift(notification);
          this.unreadCount += 1;
        }
      });

    this.getShift();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopLocationTracking();
  }

  loadRider(){


      this.riderService.getRiderById(this.riderId).subscribe((x)=>{


        this.rider = x ;
        console.log(x);



      })



  }




  // ✅ Centralized order fetching
  fetchIncomingOrders(): void {
    this.loading = true;
    forkJoin([
      this.orderService.getOrdersByRiderAndStatus(this.riderId, "PREPARING"),
      this.orderService.getOrdersByRiderAndStatus(this.riderId, "OUT_FOR_DELIVERY"),
      this.orderService.getOrdersByRiderAndStatus(this.riderId, "READY_FOR_PICKUP")
    ]).subscribe({
      next: ([confirmed, outForDelivery, ready]) => {
        this.incomingOrders = [...confirmed, ...outForDelivery, ...ready];
        this.loading = false;

        // ✅ Auto-select first order if none active
        if (this.incomingOrders.length > 0 && !this.order) {
          this.selectOrder(this.incomingOrders[0]);
        }
      },
      error: (err) => {
        console.error('Failed to fetch orders:', err);
        this.loading = false;
        this.error = 'Failed to load orders';
      }
    });
  }

  // ✅ NEW: Select order and load detail
  selectOrder(order: OrderResponseDTO): void {
    this.order = order;
    this.loadOrder(order.id);
  }

  // ✅ NEW: Manual refresh
  refreshOrders(): void {
    this.fetchIncomingOrders();
  }

  loadOrder(orderId: number): void {
    this.loading = true;
    this.orderService.getOrderById(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.determinePhase(order.orderStatus);

          // Load restaurant info
          if (order.restaurantId) {
            this.restaurantService.getRestaurantById(order.restaurantId)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (res) => this.orderRestaurant = res,
                error: (err) => console.error('Failed to load restaurant:', err)
              });
          }
          this.loading = false;
          this.error = '';
        },
        error: (err) => {
          this.error = 'Failed to load order details';
          this.loading = false;
          console.error('Error loading order:', err);
        }
      });
  }

  determinePhase(status: OrderStatus): void {
    this.currentPhase = status === 'OUT_FOR_DELIVERY' ? 'delivery' : 'pickup';
  }

  onArrivedAtRestaurant(): void {
    if (!this.order) return;
    this.toast.success('✓ Arrived at restaurant location!', 'Arrival Confirmed');
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
          this.toast.success('Order picked up successfully!', 'Pickup Complete');
        },
        error: (err) => {
          this.error = 'Failed to update pickup status';
          this.loading = false;
          this.toast.error('Pickup update failed. Please try again.');
          console.error('Error updating pickup:', err);
        }
      });
  }

  onDeliveryComplete(): void {
    if (!this.order) return;

    if (!this.deliveryOtp || this.deliveryOtp.length !== 4) {
      this.toast.warning('Please enter a valid 4-digit OTP', 'Invalid OTP');
      return;
    }

    this.loading = true;
    this.orderService.confirmDelivery(this.order.id, this.deliveryOtp)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (responseMessage) => {
          this.loading = false;
          this.toast.success(`✅ Delivery confirmed!\n${responseMessage}`, 'Success');
          // Clear order and return to list
          this.order = null;
          this.deliveryOtp = '';
          this.fetchIncomingOrders(); // refresh list
        },
        error: (err) => {
          this.loading = false;
          const msg = err.error?.message || 'Invalid OTP or request failed';
          this.toast.error(`❌ ${msg}`, 'Delivery Failed');
          console.error('OTP Verification Error:', err);
        }
      });
  }

  callRestaurant(): void {
    alert('Calling restaurant...');
  }

  callCustomer(): void {
    if (this.order?.customerPhone) {
      window.location.href = `tel:${this.order.customerPhone}`;
    } else {
      this.toast.warning('Customer phone number not available');
    }
  }

  getShift() {
    this.shiftService.getRiderShift()
      .pipe(
        catchError((error) => {
          console.error('Error fetching shift:', error);
          this.toast.error('Failed to fetch shift');
          return of(null);
        })
      )
      .subscribe((x) => {
        this.shift = x;
      });
  }

  private showToast(message: string): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage = message;
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
      const restaurant = this.orderRestaurant;
      if (restaurant?.latitude != null && restaurant?.longitude != null) {
        destinationLat = restaurant.latitude;
        destinationLng = restaurant.longitude;
        destinationName = restaurant.name || 'Restaurant';
      }
    }

    if (
      destinationLat == null ||
      destinationLng == null ||
      isNaN(destinationLat) ||
      isNaN(destinationLng)
    ) {
      this.showToast(`Location not available for ${destinationName.toLowerCase()}.`);
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}&travelmode=driving`;
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      this.showToast('Popup blocked. Please allow popups.');
    }
  }

  getTotalItems(): number {
    return this.order?.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  getEstimatedTime(): string {
    return this.order?.estimatedDeliveryTime || '15-20 min';
  }

  // === Location Tracking ===
  private startLocationTracking(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.sendLocationToServer(position.coords.latitude, position.coords.longitude);
        this.startWatchingLocation();
      },
      (error) => this.handleGeolocationError(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  private startWatchingLocation(): void {
    if (this.locationWatchId !== null) return;

    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        this.sendLocationToServer(position.coords.latitude, position.coords.longitude);
      },
      (error) => console.warn('Location watch error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }

  private sendLocationToServer(lat: number, lng: number): void {
    if (!this.riderId) return;

    const locationUpdate: LocationUpdate = { latitude: lat, longitude: lng };
    this.riderService.updateRiderLocation(this.riderId, locationUpdate).pipe(
      catchError(error => {
        console.warn('Location send failed (safe to ignore):', error);
        return of(null);
      })
    ).subscribe();
  }

  private stopLocationTracking(): void {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
    if (this.locationSendSubscription) {
      this.locationSendSubscription.unsubscribe();
      this.locationSendSubscription = null;
    }
  }

  private handleGeolocationError(error: GeolocationPositionError): void {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.showLocationPermissionBanner = true;
        break;
      case error.POSITION_UNAVAILABLE:
        console.warn('Location unavailable');
        break;
      case error.TIMEOUT:
        console.warn('Location request timed out');
        break;
    }
  }

  // === Online/Offline ===
  private loadRiderStatus(): void {
    this.riderService.getRiderById(this.riderId).subscribe((res) => {
      this.isOnline = res.availabilityStatus === "AVAILABLE";
    });
  }

  toggleStatus(): void {
    if (this.isToggling) return;
    this.isToggling = true;

    const toggle$ = this.isOnline
      ? this.riderService.goOffline(this.riderId)
      : this.riderService.goOnline(this.riderId);

    toggle$.subscribe({
      next: (updatedRider: Rider) => {
        this.isOnline = updatedRider.availabilityStatus === "AVAILABLE";
        this.isToggling = false;
        this.toast.success(`You are now ${this.isOnline ? 'online' : 'offline'}`);
      },
      error: (err) => {
        console.error('Status update failed:', err);
        this.isToggling = false;
        this.toast.error('Failed to update status');
      }
    });
  }

  // === Notifications ===
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

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      const notif = this.notifications.find(n => n.id === notificationId);
      if (notif) notif.isRead = true;
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.riderId).subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount(this.riderId).subscribe({
      next: (count) => this.unreadCount = count,
      error: (err) => console.error('Unread count load failed:', err)
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

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotificationsPanel = !this.showNotificationsPanel;

    if (this.showNotificationsPanel) {
      this.markAllAsRead();
      this.loadNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
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

  async ConncetWebSocket() {
    await this.webSocket.connect(this.riderId);
  }

  Logout() {
    this.auth.logout();
    this.router.navigate(['/vendor']).then(() => {
      this.toast.success("Successfully logged out");
    });
  }

  shiftEnd() {
    this.shiftService.endShift(this.riderId).subscribe({
      next: (data) => {
        this.toast.success("Shift ended");
        this.shift = { ...this.shift!, status: 'COMPLETED', shiftEnd: new Date().toISOString() };
        
      },
      error: (err) => {
        console.error("Error ending shift:", err);
        this.toast.error("Failed to end shift");
      }
    });
  }

  triggerSOS() {
    if (confirm('🚨 Emergency SOS!\n\nSend alert with your live location to support team?')) {
      // TODO: Implement SOS API call
      this.toast.warning('SOS signal sent. Help is on the way.', 'Emergency', {
        timeOut: 6000
      });
    }
  }

  openSupportChat() {
    alert('Support chat opened (placeholder)');
  }

  formatDuration(hours: number): string {
    if (hours == null) return '—';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }
}
