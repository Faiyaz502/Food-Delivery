import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { CouponApplyRequest } from 'src/app/Models/NotificationAndCoupon/coupon.model';
import { ReviewCreateRequest, ReviewResponse, ReviewUpdateRequest, RestaurantReviewSummary, DeliveryPersonReviewSummary } from 'src/app/Models/NotificationAndCoupon/review.model';
/** Represents a paginated response from the backend. */
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

/** Represents the sorting and pagination parameters for a request. */
interface PageableParams {
  page?: number;
  size?: number;
  sort?: string; // e.g., "createdAt,desc" or ["createdAt,desc", "rating,asc"]
}
@Injectable({
  providedIn: 'root'
})
export class ReviewService {



  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/reviews`; // Base path for the controller

  /**
   * Helper function to build HttpParams from PageableParams
   */
  private buildPageableParams(pageable: PageableParams): HttpParams {
    let params = new HttpParams();
    if (pageable.page != null) {
      params = params.set('page', pageable.page.toString());
    }
    if (pageable.size != null) {
      params = params.set('size', pageable.size.toString());
    }
    // The Spring annotation @PageableDefault expects a comma-separated string for sort
    if (pageable.sort) {
      params = params.set('sort', pageable.sort);
    }
    return params;
  }

  // POST /api/reviews/{userId}
  createReview(request: ReviewCreateRequest, userId: number): Observable<ReviewResponse> {
    const url = `${this.baseUrl}/${userId}`;
    return this.http.post<ReviewResponse>(url, request);
  }

  // PUT /api/reviews/{id}/{userId}
  updateReview(
    reviewId: number,
    userId: number,
    request: ReviewUpdateRequest
  ): Observable<ReviewResponse> {
    const url = `${this.baseUrl}/${reviewId}/${userId}`;
    return this.http.put<ReviewResponse>(url, request);
  }

  // GET /api/reviews/{id}
  getReviewById(reviewId: number): Observable<ReviewResponse> {
    const url = `${this.baseUrl}/${reviewId}`;
    return this.http.get<ReviewResponse>(url);
  }

  // GET /api/reviews/order/{orderId}
  getReviewByOrderId(orderId: number): Observable<ReviewResponse> {
    const url = `${this.baseUrl}/order/${orderId}`;
    return this.http.get<ReviewResponse>(url);
  }

  // GET /api/reviews/restaurant/{restaurantId}
  getReviewsByRestaurant(
    restaurantId: number,
    pageable: PageableParams = { page: 0, size: 20, sort: 'createdAt,desc' }
  ): Observable<Page<ReviewResponse>> {
    const url = `${this.baseUrl}/restaurant/${restaurantId}`;
    const params = this.buildPageableParams(pageable);
    return this.http.get<Page<ReviewResponse>>(url, { params });
  }

    getReviewsListByRestaurant(
    restaurantId: number): Observable<ReviewResponse[]> {
    const url = `${this.baseUrl}/restaurant-List/${restaurantId}`;

    return this.http.get<ReviewResponse[]>(url);
  }





  // GET /api/reviews/user/{userId}
  getReviewsByUser(
    userId: number,
    pageable: PageableParams = { page: 0, size: 20, sort: 'createdAt,desc' }
  ): Observable<Page<ReviewResponse>> {
    const url = `${this.baseUrl}/user/${userId}`;
    const params = this.buildPageableParams(pageable);
    return this.http.get<Page<ReviewResponse>>(url, { params });
  }

  // GET /api/reviews/my-reviews?userId=12
  // Note: This endpoint is similar to getReviewsByUser but uses query parameters for userId.
  getMyReviews(
    userId: number,
    pageable: PageableParams = { page: 0, size: 20, sort: 'createdAt,desc' }
  ): Observable<Page<ReviewResponse>> {
    const url = `${this.baseUrl}/my-reviews`;
    // Start with Pageable params, then add userId as a required query param
    let params = this.buildPageableParams(pageable);
    params = params.set('userId', userId.toString());
    return this.http.get<Page<ReviewResponse>>(url, { params });
  }

  // GET /api/reviews/restaurant/{restaurantId}/summary
  getRestaurantReviewSummary(restaurantId: number): Observable<RestaurantReviewSummary> {
    const url = `${this.baseUrl}/restaurant/${restaurantId}/summary`;
    return this.http.get<RestaurantReviewSummary>(url);
  }

  // GET /api/reviews/delivery-person/{deliveryPersonId}/summary
  getDeliveryPersonReviewSummary(
    deliveryPersonId: number
  ): Observable<DeliveryPersonReviewSummary> {
    const url = `${this.baseUrl}/delivery-person/${deliveryPersonId}/summary`;
    return this.http.get<DeliveryPersonReviewSummary>(url);
  }

  // DELETE /api/reviews/{id}/{userId}
  deleteReview(reviewId: number, userId: number): Observable<void> {
    const url = `${this.baseUrl}/${reviewId}/${userId}`;
    // Spring returns ResponseEntity<Void> and HttpStatus.noContent().build(), so we expect a void/empty response.
    return this.http.delete<void>(url);
  }
}
