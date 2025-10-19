import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

// ApexCharts types
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels
} from 'ng-apexcharts';
/** Represents a paginated response from the backend. (Needed for service response handling) */
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Current page number (0-indexed)
  last: boolean;
  first: boolean;
  // Add other properties as needed
}
// Models
import { CouponResponse, DiscountType, CouponType, CouponCreateRequest, CouponApplyRequest } from 'src/app/Models/NotificationAndCoupon/coupon.model';
import { ReviewResponse, RestaurantReviewSummary, ReviewUpdateRequest } from 'src/app/Models/NotificationAndCoupon/review.model';

// Services
import { CouponService } from 'src/app/services/reviewAndCoupon/coupon.service';
import { ReviewService } from 'src/app/services/reviewAndCoupon/review.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {

// Dependency injection via inject() is often preferred but constructor is fine too


    coupon! : CouponApplyRequest ; 
  // Reviews
  reviews: ReviewResponse[] = [];
  selectedReview: ReviewResponse | null = null;
  reviewForm: FormGroup;
  restaurantSummaries: RestaurantReviewSummary[] = [];

  // Coupons
  coupons: CouponResponse[] = [];
  couponForm: FormGroup;
  validationResult: any ;

  // Charts - Fully initialized to avoid TS errors
  public foodRatingChartOptions = {
    series: [] as ApexAxisChartSeries,
    chart: { type: 'bar', height: 350 } as ApexChart,
    xaxis: { categories: [] } as ApexXAxis,
    yaxis: { max: 5 } as ApexYAxis,
    title: { text: 'Restaurant Ratings' } as ApexTitleSubtitle,
    dataLabels: { enabled: false } as ApexDataLabels
  };

  public couponUsageChartOptions = {
    series: [] as ApexAxisChartSeries,
    chart: { type: 'bar', height: 300 } as ApexChart,
    xaxis: { categories: [] } as ApexXAxis,
    title: { text: 'Coupon Usage' } as ApexTitleSubtitle,
    dataLabels: { enabled: false } as ApexDataLabels
  };

  constructor(  private fb: FormBuilder,
    private reviewService: ReviewService,
    private couponService: CouponService) {
    this.reviewForm = this.fb.group({
      foodRating: [5],
      deliveryRating: [5],
      comment: [''],
      deliveryPersonRating: [null]
    });

    this.couponForm = this.fb.group({
      code: [''],
      description: [''],
      discountType: [DiscountType.PERCENTAGE],
      discountValue: [10],
      minOrderAmount: [50],
      maxDiscountAmount: [100],
      couponType: [CouponType.GENERAL],
      usageLimit: [100],
      validFrom: [new Date().toISOString().substring(0, 16)],
      validUntil: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16)],
      applicableOnFirstOrder: [false]
    });
  }

  ngOnInit(): void {
    this.loadReviews();
    this.loadCoupons();
    this.loadRestaurantSummaries();
  }

  // === REVIEWS ===
  /**
   * FIX 1: Replaced getProductReviews with getReviewsByRestaurant (assuming restaurantId 1)
   * and correctly mapped the Page<ReviewResponse> return type to extract reviews.
   */
  loadReviews(): void {
    // Assuming we are loading reviews for a specific Restaurant ID, e.g., 1
    // The service returns a Page<ReviewResponse>
    this.reviewService.getReviewsByRestaurant(1).subscribe((page: Page<ReviewResponse>) => {
      this.reviews = page.content;
    });
  }

  selectReview(review: ReviewResponse): void {
    this.selectedReview = review;
    this.reviewForm.patchValue({
      foodRating: review.foodRating,
      deliveryRating: review.deliveryRating,
      comment: review.comment,
      deliveryPersonRating: review.deliveryPersonRating || null
    });
  }

  /**
   * FIX 2: Updated updateReview to include the required 'userId' argument,
   * which is extracted from the owner of the currently selected review.
   */
  updateReview(): void {
    if (!this.selectedReview) return;
    const updateData: ReviewUpdateRequest = this.reviewForm.value;
    const userId = this.selectedReview.userId; // Get the ID of the user who owns the review

    this.reviewService.updateReview(this.selectedReview.id, userId, updateData).subscribe((updated: ReviewResponse) => {
      const index = this.reviews.findIndex(r => r.id === updated.id);
      if (index !== -1) this.reviews[index] = updated;
      this.selectedReview = updated;
    });
  }

  /**
   * FIX 3: Updated deleteReview to include the required 'userId' argument,
   * extracted by finding the review in the local array first.
   */
  deleteReview(id: number): void {
    const reviewToDelete = this.reviews.find(r => r.id === id);
    if (!reviewToDelete) return; // Cannot delete without knowing the userId

    const userId = reviewToDelete.userId;

    this.reviewService.deleteReview(id, userId).subscribe(() => {
      this.reviews = this.reviews.filter(r => r.id !== id);
      if (this.selectedReview?.id === id) this.selectedReview = null;
    });
  }

  // === COUPONS ===
  loadCoupons(): void {
    // Assuming getActiveCoupons() is a valid method on the CouponService
    this.couponService.getActiveCoupons().subscribe((coupons: CouponResponse[]) => {
      this.coupons = coupons;
      this.updateCouponUsageChart();
    });
  }

  createCoupon(): void {
    const req: CouponCreateRequest = this.couponForm.value;
    this.couponService.createCoupon(req).subscribe((coupon: CouponResponse) => {
      this.coupons.push(coupon);
      this.couponForm.reset({
        code: '',
        description: '',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 50,
        maxDiscountAmount: 100,
        couponType: CouponType.GENERAL,
        usageLimit: 100,
        validFrom: new Date().toISOString().substring(0, 16),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
        applicableOnFirstOrder: false
      });
      this.updateCouponUsageChart();
    });
  }

  validateCoupon(): void {
    const code = (document.getElementById('validateCode') as HTMLInputElement)?.value || '';
    const amount = parseFloat((document.getElementById('validateAmount') as HTMLInputElement)?.value || '0');
    if (!code || !amount) return;

    this.couponService.validateCode(code).subscribe((res: any) => {

      console.log(res);
      
      this.validationResult = res;

      console.log(this.validationResult);
      
    });
  }

  applyCoupon(code: string, amount : number): void {
    // NOTE: The backend endpoint for applyCoupon takes a body (CouponApplyRequest).
    this.coupon.couponCode = code;
    this.coupon.orderAmount = amount;
    
    // The component logic here seems to assume a simpler service call which takes only the code.
    // Keeping the original component logic, but noting the mismatch with a typical applyCoupon endpoint.
    this.couponService.applyCoupon(this.coupon).subscribe(() => {
      this.loadCoupons();

    this.coupon.couponCode = '';
    this.coupon.orderAmount = 0;

    });
  }

  deactivateCoupon(id: number): void {
    this.couponService.deactivateCoupon(id).subscribe(() => {
      this.coupons = this.coupons.map(c => c.id === id ? { ...c, isActive: false } : c);
    });
  }

  // === CHARTS ===
  loadRestaurantSummaries(): void {
    // We retain the mock data as the ReviewService only provides getRestaurantReviewSummary(id)
    // and doesn't have a get all summaries method.
    this.restaurantSummaries = [
      { restaurantId: 1, restaurantName: 'Burger Palace', averageFoodRating: 4.5, averageDeliveryRating: 4.2, overallRating: 4.35, totalReviews: 120 },
      { restaurantId: 2, restaurantName: 'Pizza Heaven', averageFoodRating: 4.7, averageDeliveryRating: 3.9, overallRating: 4.3, totalReviews: 95 },
      { restaurantId: 3, restaurantName: 'Sushi Delight', averageFoodRating: 4.8, averageDeliveryRating: 4.6, overallRating: 4.7, totalReviews: 88 }
    ];
    this.updateFoodRatingChart();
  }

  updateFoodRatingChart(): void {
    const names = this.restaurantSummaries.map(r => r.restaurantName);
    const foodRatings = this.restaurantSummaries.map(r => r.averageFoodRating);
    const deliveryRatings = this.restaurantSummaries.map(r => r.averageDeliveryRating);

    this.foodRatingChartOptions = {
      series: [
        { name: 'Food Rating', data: foodRatings },
        { name: 'Delivery Rating', data: deliveryRatings }
      ],
      chart: { type: 'bar', height: 350 },
      xaxis: { categories: names },
      yaxis: { max: 5 },
      title: { text: 'Restaurant Ratings' },
      dataLabels: { enabled: false }
    };
  }

  updateCouponUsageChart(): void {
    const codes = this.coupons.map(c => c.code);
    const usage = this.coupons.map(c => c.usedCount || 0);

    this.couponUsageChartOptions = {
      series: [{ name: 'Usage Count', data: usage }],
      chart: { type: 'bar', height: 300 },
      xaxis: { categories: codes },
      title: { text: 'Coupon Usage' },
      dataLabels: { enabled: false }
    };
  }

  // Expose enums to template
  protected readonly DiscountType = DiscountType;
  protected readonly CouponType = CouponType;
}