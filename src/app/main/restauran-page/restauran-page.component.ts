import { ApiService } from './../../services/api.service';
import { Component, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { ReviewResponse, RestaurantReviewSummary } from 'src/app/Models/NotificationAndCoupon/review.model';
import { AddCartItemDTO } from 'src/app/Models/Order/order.models';
import { Restaurant } from 'src/app/Models/restaurant.model';

import { CartService } from 'src/app/services/Orders/order.service';
import { ReviewService } from 'src/app/services/reviewAndCoupon/review.service';
// --- MOCK DATA ---
interface Review {
  name: string;
  order: string;
  stars: number;
  text: string;
  date: string;
}
const MOCK_REVIEWS: Review[] = [
  { name: 'Sarah K.', order: 'Truffle Deluxe', stars: 5, text: "A truly exceptional burger! The truffle aioli was divine. Five stars for flavor and presentation. The service was impeccable, and the ambiance made the experience even better.", date: '2 days ago' },
  { name: 'Mark T.', order: 'Blackened Salmon', stars: 4, text: "The salmon was fresh, but the bun was a little soggy from the delivery. Otherwise, great flavor and arrived on time. I'd definitely order again but maybe pick it up next time.", date: '5 days ago' },
  { name: 'Jessica A.', order: 'Vegetarian Portobello', stars: 5, text: "Hands down the best veggie burger I've ever had. So flavorful and substantial. A perfect meat-free option that doesn't feel like a compromise.", date: '1 week ago' },
  { name: 'David L.', order: 'Pulled Pork', stars: 5, text: "Perfectly smoked and tender. The BBQ sauce was incredible—sweet and tangy without overpowering the meat. This is my new favorite lunch spot.", date: '2 weeks ago' },
  { name: 'Emily R.', order: 'Artisan Pasta', stars: 4, text: "Excellent pasta dish, perfectly al dente! Just a little bit slow on the delivery time, but the food made up for it.", date: '3 weeks ago' },
  { name: 'Chris P.', order: 'Signature Salad', stars: 5, text: "Crisp, fresh, and perfectly balanced dressing. A light but satisfying meal. I appreciate the high-quality ingredients.", date: '1 month ago' }
];

@Component({
  selector: 'app-restauran-page',
  templateUrl: './restauran-page.component.html',
  styleUrls: ['./restauran-page.component.scss']
})

export class RestauranPageComponent {
addToCart(arg0: string) {
throw new Error('Method not implemented.');
}


  // 1. STATE PROPERTIES (Replaced Signals)
    reviews: Review[] = MOCK_REVIEWS;
    currentIndex: number = 0;
    windowWidth: number = window.innerWidth;

    // 2. DERIVED STATE PROPERTIES (Calculated in methods)
    itemsPerView: number = 1;
    maxIndex: number = 0;

    // 3. COMPUTED STATE (Replaced Computed Signals with a Getter)
    get wrapperStyle(): string {
        const perView = this.itemsPerView;
        // Calculate the percentage translation based on the current index and items per view.
        const percentageOffset = this.currentIndex * (100 / perView);

        // Return the CSS transform value
        return `translateX(-${percentageOffset}%)`;
    }

    // Private method to calculate responsive values (replaces computed signals logic)
    private calculateResponsiveValues(): void {
        this.itemsPerView = this.windowWidth >= 768 ? 2 : 1;
        const total = this.reviews.length;
        // Calculates the last possible index to show the final set of cards
        this.maxIndex = Math.max(0, total - this.itemsPerView);

        // Ensure index is valid after screen size changes (e.g., if maxIndex drops)
        this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
    }

    // 4. LIFECYCLE & EVENT HANDLERS

    ngOnInit() {
      // Initialize the responsive values on load
      this.calculateResponsiveValues();
    }

    // Listens for window resize events to update the layout responsiveness
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        // Update window width
        this.windowWidth = (event.target as Window).innerWidth;

        // Recalculate responsive properties
        this.calculateResponsiveValues();
    }

    prevReview() {
        // Direct property mutation (replaces signal.update)
        this.currentIndex = Math.max(0, this.currentIndex - 1);
    }

    nextReview() {
        // Direct property mutation (replaces signal.update)
        this.currentIndex = Math.min(this.maxIndex, this.currentIndex + 1);
    }
}
