import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { DeliveryOTP, OrderResponseDTO, OrderStatus } from 'src/app/Models/Order/order.models';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { Rider } from 'src/app/Models/rider.model';
import { OrderService } from 'src/app/services/Orders/order.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { ReviewService } from 'src/app/services/reviewAndCoupon/review.service';
import { RiderService } from 'src/app/services/Rider/rider.service';

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.scss']
})
export class TrackOrderComponent {

  orderId!: number;
  userId = environment.userId
  order!: OrderResponseDTO;
  isLoading = true;
  rider!:Rider;
  restuarant!:Restaurant;
  orderOTP:DeliveryOTP | null  = null 
  error: string | null = null;

  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService ,
    private router : Router ,
    private riderService:RiderService ,
    private restaurantService:RestaurantService, 
    private fb: FormBuilder ,
    private reviewService:ReviewService
  ) {}

  ngOnInit(): void {
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

  nagivateToOrderList() {

     this.router.navigate(['main/orderList']);

}




  getOTP(orderId:number){


    this.orderService.getOrderOTP(orderId).subscribe((res)=>{

      this.orderOTP = res ;

      console.log(res);
      


    })


  }


  loadOrder(): void {
    this.isLoading = true;
    this.error = null;

    const sub = this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        console.log(order);
       
        this.getRiderById(this.order.riderId);
        this.getRestaurantById(this.order.restaurantId)

        this.checkIsReviewable();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load order:', err);
        this.error = 'Failed to load order details. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.destroy$.next(); // complete all takeUntil streams
  this.destroy$.complete(); // finalize the subject
  }


  // Optional: Format estimated delivery time
  getEstimatedDeliveryTime(): string {
    // Example: if your OrderResponseDTO has `estimatedDeliveryMinutes`
    // return `${this.order.estimatedDeliveryMinutes} min`;
    return '25-30 min'; // fallback or mock
  }



  getProgressWidth(): number {
    const status = this.order.orderStatus;

    if (status === 'PLACED') return 25;
    if (['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(status)) return 50;
    if (status === 'OUT_FOR_DELIVERY') return 75;
    if (status === 'DELIVERED') return 100;
    if (status === 'CANCELLED') return 0; // or 100 with red?
    return 0;
  }

  getStepConfig() {
    const { orderStatus, createdAt, updatedAt } = this.order;

    const isPlaced = orderStatus !== 'CANCELLED'; // PLACED or beyond
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
        bgClass: isPlaced
          ? 'bg-emerald-500 shadow-lg'
          : 'bg-gray-100 border-2 border-gray-300',
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
        bgClass: isPreparing
          ? 'bg-emerald-500 shadow-lg'
          : 'bg-gray-100 border-2 border-gray-300',
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
        bgClass: isDelivered
          ? 'bg-emerald-500 shadow-lg'
          : 'bg-gray-100 border-2 border-gray-300',
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


  //rider and restuarant

    loading: boolean = false;
  errorMessage: string = '';

  getRiderById(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.riderService.getRiderById(id)
      .pipe(
        catchError(error => {
          console.error('Error fetching rider:', error);
          this.errorMessage = 'Failed to load rider data. Please try again later.';
          this.loading = false;
          return of(null); // return empty observable to continue safely
        })
      )
      .subscribe(res => {
        this.loading = false;
        if (res) {
          this.rider = res;
          console.log('Rider data:', res);
        }
      });
  }

  getRestaurantById(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.restaurantService.getRestaurantById(id)
      .pipe(
        catchError(error => {
          console.error('Error fetching restaurant:', error);
          this.errorMessage = 'Failed to load restaurant data. Please try again later.';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(res => {
        this.loading = false;
        if (res) {
          this.restuarant = res;
          console.log('Restaurant data:', res);
        }
      });
  }



  //Review
  stars = [1, 2, 3, 4, 5];

  isReviewModalOpen = false;
selectedOrder: any = null;

// Hover states
hoverFoodRating: number | null = null;
hoverDeliveryRating: number | null = null;
hoverDeliveryPersonRating: number | null = null;

// Review form
reviewForm: FormGroup = this.fb.group({
  foodRating: [null as number | null, Validators.required],
  deliveryRating: [null as number | null, Validators.required],
  deliveryPersonRating: [null as number | null],
  comment: ['']
});

// Modal state
 // or your Order type

// Open modal (call this when user clicks "Leave Review")
openReviewModal(order: any) {
  this.selectedOrder = order;
  this.isReviewModalOpen = true;
  this.reviewForm.reset(); // clear previous input
}

// Close modal
closeReviewForm() {
  this.isReviewModalOpen = false;
  this.selectedOrder = null;
}

// Set ratings
setFoodRating(rating: number) {
  this.reviewForm.get('foodRating')?.setValue(rating);
}

setDeliveryRating(rating: number) {
  this.reviewForm.get('deliveryRating')?.setValue(rating);
}

setDeliveryPersonRating(rating: number) {
  this.reviewForm.get('deliveryPersonRating')?.setValue(rating);
}
 private destroy$ = new Subject<void>(); // 👈 Add this line
// Submit
submitReview() {
  if (this.reviewForm.valid && this.selectedOrder) {
    
    const reviewData = {
      ...this.reviewForm.value,
      orderId: this.selectedOrder.id  // ← add orderId here
    };

  
    console.log('Submitting review:', reviewData, 'for order:', this.selectedOrder.id);

    this.reviewService.createReview(reviewData,this.userId)
      .pipe(takeUntil(this.destroy$)) // ✅ Prevent memory leak
      .subscribe({
        next: (res) => {
          console.log('Review submitted successfully:', res);
          // ✅ Close modal ONLY after success
          this.closeReviewForm();
          // Optional: show success message
          alert('Thank you for your review!');
        },
        error: (err) => {
          console.error('Failed to submit review:', err);
          // ❌ Don't close modal on error — let user retry
          alert('Failed to submit review. Please try again.');
        }
      });
  }
}

checkIsReviewable() {
  if (this.order.orderStatus === 'DELIVERED') {
    console.log('Order is delivered');

    this.reviewService.getReviewByOrderId(this.order.id).pipe(
      catchError(error => {
        // If 404 (Not Found), treat as "no review"
        if (error.status === 404) {
          console.log('No review found for this order');
          return of(null); // return null as observable
        }
        // For other errors, re-throw
        throw error;
      })
    ).subscribe(review => {
      if (review === null) {
        this.openReviewModal(this.order);
      } else {
        console.log('Review already exists:', review);
        // Optionally show "Already reviewed" message
      }
    });
  }
}


 

  }







