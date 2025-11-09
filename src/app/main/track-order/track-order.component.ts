import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { Subscription, interval, of, Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { environment } from 'src/app/Envirment/environment';
import { DeliveryOTP, OrderResponseDTO } from 'src/app/Models/Order/order.models';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { LocationUpdate, Rider } from 'src/app/Models/rider.model';
import { TokenService } from 'src/app/services/authService/token.service';

import { OrderService } from 'src/app/services/Orders/order.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { ReviewService } from 'src/app/services/reviewAndCoupon/review.service';
import { RiderService } from 'src/app/services/Rider/rider.service';

// Fix Leaflet icon issue in Angular
delete (window as any).L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.scss']
})
export class TrackOrderComponent implements OnInit, AfterViewInit, OnDestroy {

  orderId!: number;
  userId : any;
  order!: OrderResponseDTO;
  isLoading = true;
  rider: Rider | null = null;
  restuarant: Restaurant | null = null;
  orderOTP: DeliveryOTP | null = null;
  error: string | null = null;

  // Map
  private map: L.Map | null = null;
  private riderMarker: L.Marker | null = null;
  private locationPollSubscription: Subscription | null = null;

  // Review
  stars = [1, 2, 3, 4, 5];
  isReviewModalOpen = false;
  selectedOrder: any = null;
  hoverFoodRating: number | null = null;
  hoverDeliveryRating: number | null = null;
  hoverDeliveryPersonRating: number | null = null;
  reviewForm: FormGroup = this.fb.group({
    foodRating: [null as number | null, Validators.required],
    deliveryRating: [null as number | null, Validators.required],
    deliveryPersonRating: [null as number | null],
    comment: ['']
  });

  // Subscriptions
  private mainSubscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router,
    private riderService: RiderService,
    private restaurantService: RestaurantService,
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private token : TokenService
  ) {}

  ngOnInit(): void {
     this.userId = Number(this.token.getId());

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.orderId = +idParam;
      this.loadOrder();
      this.getOTP(this.orderId);
    } else {
      this.error = 'Order ID is missing';
      this.isLoading = false;
    }
  }

  ngAfterViewInit(): void {
    // Map init deferred until rider data arrives
  }

  ngOnDestroy(): void {
    this.mainSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();

    if (this.locationPollSubscription) {
      this.locationPollSubscription.unsubscribe();
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  // ===== ORDER & DATA =====

  loadOrder(): void {
    this.isLoading = true;
    this.error = null;

    const sub = this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.getRiderById(order.riderId);
        this.getRestaurantById(order.restaurantId);
        this.checkIsReviewable();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load order:', err);
        this.error = 'Failed to load order details.';
        this.isLoading = false;
      }
    });

    this.mainSubscription.add(sub);
  }

  getOTP(orderId: number): void {
    this.orderService.getOrderOTP(orderId).subscribe((res) => {
      this.orderOTP = res;
    });
  }

  getRiderById(id: number): void {
    if (this.locationPollSubscription) {
      this.locationPollSubscription.unsubscribe();
      this.locationPollSubscription = null;
    }

    this.riderService.getRiderById(id).pipe(
      catchError(error => {
        console.error('Error fetching rider:', error);
        this.error = 'Failed to load rider data.';
        return of(null);
      })
    ).subscribe(res => {
      this.rider = res;
      if (res && typeof res.currentLatitude === 'number' && typeof res.currentLongitude === 'number') {
        this.initializeMapAndPolling();
      } else {
        console.warn('Rider has no valid initial location.');
      }
    });
  }

  getRestaurantById(id: number): void {
    this.restaurantService.getRestaurantById(id).pipe(
      catchError(error => {
        console.error('Error fetching restaurant:', error);
        this.error = 'Failed to load restaurant data.';
        return of(null);
      })
    ).subscribe(res => {
      this.restuarant = res;
    });
  }

  // ===== MAP & LOCATION POLLING =====

  private initializeMapAndPolling(): void {
    if (!this.rider ||
        typeof this.rider.currentLatitude !== 'number' ||
        typeof this.rider.currentLongitude !== 'number') {
      return;
    }

    this.initMap();

    if (!this.locationPollSubscription) {
      this.locationPollSubscription = interval(10000).subscribe(() => {
        this.fetchRiderLocation();
      });
    }
  }

  private initMap(): void {
    const container = document.getElementById('rider-map');
    if (!container) return;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('rider-map').setView(
      [this.rider!.currentLatitude, this.rider!.currentLongitude],
      14
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.riderMarker = L.marker([this.rider!.currentLatitude, this.rider!.currentLongitude], {
      icon: L.divIcon({
        className: 'rider-marker',
        html: `
          <div class="relative">
            <div class="absolute -inset-4 bg-emerald-500/20 rounded-full animate-ping"></div>
            <div class="relative w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      })
    }).addTo(this.map);
  }

  private fetchRiderLocation(): void {
    if (!this.rider?.id) return;

    this.riderService.getRiderLocation(this.rider.id).pipe(
      catchError(error => {
        console.warn('Location update failed:', error);
        return of(null);
      })
    ).subscribe((location: LocationUpdate | null) => {
      if (!location) return;

      const { latitude, longitude } = location;
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        // Update local rider (optional, for consistency)
        if (this.rider) {
          this.rider.currentLatitude = latitude;
          this.rider.currentLongitude = longitude;
        }
        // Update map
        this.updateRiderPosition(latitude, longitude);
      } else {
        console.warn('Invalid location data received:', location);
      }
    });
  }

  private updateRiderPosition(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.riderMarker) {
      this.riderMarker.setLatLng([lat, lng]);
    } else {
      this.riderMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'rider-marker',
          html: `
            <div class="relative">
              <div class="absolute -inset-4 bg-emerald-500/20 rounded-full animate-ping"></div>
              <div class="relative w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        })
      }).addTo(this.map);
    }

    this.map.panTo([lat, lng]);
  }

  // ===== UI HELPERS =====

  getEstimatedDeliveryTime(): string {
    return '25-30 min';
  }

  getProgressWidth(): number {
    const status = this.order?.orderStatus;
    if (!status) return 0;

    if (status === 'PLACED') return 25;
    if (['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(status)) return 50;
    if (status === 'OUT_FOR_DELIVERY') return 75;
    if (status === 'DELIVERED') return 100;
    if (status === 'CANCELLED') return 0;
    return 0;
  }

  getStepConfig() {
    if (!this.order) return [];

    const { orderStatus, createdAt, updatedAt } = this.order;
    const isPlaced = orderStatus !== 'CANCELLED';
    const isPreparing = ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderStatus);
    const isOnTheWay = ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderStatus);
    const isDelivered = orderStatus === 'DELIVERED';
    const isActivePlaced = orderStatus === 'PLACED';
    const isActivePreparing = ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(orderStatus);
    const isActiveOnTheWay = orderStatus === 'OUT_FOR_DELIVERY';

    return [
      {
        label: 'Order Placed',
        time: createdAt ? this.formatTime(createdAt) : '—',
        icon: 'M5 13l4 4L19 7',
        completed: isPlaced,
        active: isActivePlaced,
        bgClass: isPlaced ? 'bg-emerald-500 shadow-lg' : 'bg-gray-100 border-2 border-gray-300',
        textColor: isPlaced ? 'text-gray-900' : 'text-gray-400',
        timeColor: isPlaced ? 'text-gray-500' : 'text-gray-300',
        animateClass: '',
        iconColor: isPlaced ? 'text-white' : 'text-gray-400'
      },
      {
        label: 'Preparing',
        time: '—',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        completed: isPreparing,
        active: isActivePreparing,
        bgClass: isPreparing ? 'bg-emerald-500 shadow-lg' : 'bg-gray-100 border-2 border-gray-300',
        textColor: isPreparing ? 'text-gray-900' : 'text-gray-400',
        timeColor: isPreparing ? 'text-gray-500' : 'text-gray-300',
        animateClass: '',
        iconColor: isPreparing ? 'text-white' : 'text-gray-400'
      },
      {
        label: 'OUT_FOR_DELIVERY',
        time: '—',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        completed: isOnTheWay,
        active: isActiveOnTheWay,
        bgClass: isOnTheWay
          ? (isActiveOnTheWay
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 scale-105 shadow-xl'
              : 'bg-emerald-500 shadow-lg')
          : 'bg-gray-100 border-2 border-gray-300',
        textColor: isOnTheWay ? 'text-gray-900' : 'text-gray-400',
        timeColor: isOnTheWay ? 'text-gray-500' : 'text-gray-300',
        animateClass: isActiveOnTheWay ? 'animate-pulse' : '',
        iconColor: isOnTheWay ? 'text-white' : 'text-gray-400'
      },
      {
        label: 'Delivered',
        time: isDelivered ? this.formatTime(updatedAt!) : '—',
        icon: 'M5 13l4 4L19 7',
        completed: isDelivered,
        active: isDelivered,
        bgClass: isDelivered ? 'bg-emerald-500 shadow-lg' : 'bg-gray-100 border-2 border-gray-300',
        textColor: isDelivered ? 'text-gray-900' : 'text-gray-400',
        timeColor: isDelivered ? 'text-gray-500' : 'text-gray-300',
        animateClass: '',
        iconColor: isDelivered ? 'text-white' : 'text-gray-400'
      }
    ];
  }

  isCancelled(): boolean {
    return this.order?.orderStatus === 'CANCELLED';
  }

  private formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  goBack(): void {
    window.history.back();
  }

  nagivateToOrderList(): void {
    this.router.navigate(['main/orderList']);
  }

  // ===== REVIEW =====

  openReviewModal(order: any): void {
    this.selectedOrder = order;
    this.isReviewModalOpen = true;
    this.reviewForm.reset();
  }

  closeReviewForm(): void {
    this.isReviewModalOpen = false;
    this.selectedOrder = null;
  }

  setFoodRating(rating: number): void {
    this.reviewForm.get('foodRating')?.setValue(rating);
  }

  setDeliveryRating(rating: number): void {
    this.reviewForm.get('deliveryRating')?.setValue(rating);
  }

  setDeliveryPersonRating(rating: number): void {
    this.reviewForm.get('deliveryPersonRating')?.setValue(rating);
  }

  submitReview(): void {
    if (this.reviewForm.valid && this.selectedOrder) {
      const reviewData = {
        ...this.reviewForm.value,
        orderId: this.selectedOrder.id
      };

      this.reviewService.createReview(reviewData, this.userId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          alert('Thank you for your review!');
          this.closeReviewForm();
        },
        error: () => {
          alert('Failed to submit review. Please try again.');
        }
      });
    }
  }

  checkIsReviewable(): void {
    if (this.order?.orderStatus === 'DELIVERED') {
      this.reviewService.getReviewByOrderId(this.order.id).pipe(
        catchError(error => {
          return error.status === 404 ? of(null) : throwError(() => error);
        })
      ).subscribe(review => {
        if (review === null) {
          this.openReviewModal(this.order);
        }
      });
    }
  }
}
