import { ApiService } from './../../services/api.service';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { ReviewResponse, RestaurantReviewSummary } from 'src/app/Models/NotificationAndCoupon/review.model';
import { AddCartItemDTO } from 'src/app/Models/Order/order.models';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { CartService } from 'src/app/services/Orders/order.service';
import { ReviewService } from 'src/app/services/reviewAndCoupon/review.service';

@Component({
  selector: 'app-restauran-page',
  templateUrl: './restauran-page.component.html',
  styleUrls: ['./restauran-page.component.scss']
})
export class RestauranPageComponent {

 restaurantId: number = 0;
  restaurant: Restaurant = {} as Restaurant; // DEMO DATA - Load from a service
  menuCategories: any[] = []; // DEMO DATA
  reviews: ReviewResponse[] = [];
  reviewSummary: RestaurantReviewSummary = {} as RestaurantReviewSummary;
  selectedCategory: any;
  userId: number = 1; // DEMO USER ID

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private reviewService: ReviewService,
    // Inject RestaurantService here
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.restaurantId = +params.get('id')!;
      this.loadRestaurantData(this.restaurantId);
      this.loadReviews(this.restaurantId);
    });
  }

  loadRestaurantData(id: number) {
    // **DEMO METHOD**: Replace this with a call to a real RestaurantService
    // Example: this.restaurantService.getRestaurantById(id).subscribe(res => { ... });
    this.restaurant = { /* Mock Restaurant Data */ } as Restaurant;
    this.menuCategories = [ /* Mock Categories/Menu */ ];
    this.selectedCategory = this.menuCategories[0];
  }

  loadReviews(restaurantId: number) {
    this.reviewService.getRestaurantReviewSummary(restaurantId).subscribe(summary => {
      this.reviewSummary = summary;
    });
    this.reviewService.getReviewsByRestaurant(restaurantId, { page: 0, size: 5, sort: 'createdAt,desc' })
      .subscribe(page => {
        this.reviews = page.content;
      });
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
    // Smooth scroll to the category's section
    document.getElementById(category.slug)?.scrollIntoView({ behavior: 'smooth' });
  }

  addToCart(item: MenuItem) {
    const cartItem: AddCartItemDTO = {
      menuItemId: item.id,
      quantity: 1, // Default quantity
      // specialInstructions can be added via a modal or form
    };

    this.cartService.addItemToCart(this.userId, cartItem).subscribe({
      next: () => console.log('Item added to cart!'),
      error: (err) => console.error('Failed to add item to cart', err)
    });
  }

}
