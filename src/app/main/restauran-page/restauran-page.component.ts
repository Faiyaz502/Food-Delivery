import { ApiService } from './../../services/api.service';
import { Component, HostListener ,AfterViewInit, Input} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { ReviewResponse, RestaurantReviewSummary } from 'src/app/Models/NotificationAndCoupon/review.model';
import { AddCartItemDTO } from 'src/app/Models/Order/order.models';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { Review } from 'src/app/Models/review.model';
import { MenuItemService } from 'src/app/services/menu-item.service';

import { CartService } from 'src/app/services/Orders/order.service';
import { MenuCategoryDto, MenuCategoryService } from 'src/app/services/restaurant/menu-category.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { ReviewService } from 'src/app/services/reviewAndCoupon/review.service';
import * as L from 'leaflet';




@Component({
  selector: 'app-restauran-page',
  templateUrl: './restauran-page.component.html',
  styleUrls: ['./restauran-page.component.scss']
})

export class RestauranPageComponent {





  restaurantId = 2;
  restaurant!: Restaurant;
   categories!:MenuCategoryDto[];
  menuItems!: MenuItem[];
   reviews!: ReviewResponse[];




  constructor(
    private categoryService:MenuCategoryService,
    private restaurantService:RestaurantService,
    private menuItemsService: MenuItemService ,
    private reviewService : ReviewService ,
    private menucategoryService : MenuCategoryService

  ){}

   ngOnInit(): void {
    this.getAllCategory();
    this.getAllRestaurant();
    this.getAllMenuItems();
    this.getAllReviewsById();
    this.getAllCategoryByRestaurant();
  }


  getAllCategory(){

    this.categoryService.getAllCategories().subscribe((res)=>{


    })
  }

  getAllRestaurant(){

    this.restaurantService.getRestaurantById(this.restaurantId).subscribe((res)=>{

        this.restaurant = res ;




    })
  }

  getAllCategoryByRestaurant(){

    this.categoryService.getCategoryByRestaurant(this.restaurantId).subscribe((res)=>{

      this.categories = res ;

       console.log(res);

    })

  }





  getAllMenuItems(){

    this.menuItemsService.getMenuItemByRestaurant(this.restaurantId).subscribe((res)=>{

     this.menuItems = res ;

    })}



    //Review

getAllReviewsById(): void {
  this.reviewService.getReviewsListByRestaurant(this.restaurantId).subscribe({
    next: (res) => {
      this.reviews = res;
      console.log(' Reviews fetched successfully:', this.reviews);
    },
    error: (err) => {
      console.error(' Error fetching reviews:', err);
    }
  });
}






     currentIndex = 0;

       prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  next(): void {
    if (this.currentIndex < this.reviews.length - 1) {
      this.currentIndex++;
    }
  }


  ///map


  private map!: L.Map;

  // Custom restaurant icon (Keep this as is)
  restaurantIcon = L.icon({
    iconUrl: 'assets/img/restLocation.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  ngAfterViewInit(): void {
    // Check if restaurant data is available before initializing
    if (this.restaurant && this.restaurant.latitude && this.restaurant.longitude) {
      this.initMap();
    }
  }

private initMap(): void {
  // 1. Get restaurant data (assuming this is where lat/lon comes from)
  // Let's assume you have a single restaurant object here, e.g., 'this.restaurant'
  const rest = this.restaurant;

  // 2. 🚨 Defensive Check: Ensure latitude and longitude are valid numbers
  if (rest && rest.latitude !== undefined && rest.latitude !== null &&
      rest.longitude !== undefined && rest.longitude !== null) {

    // 3. Assign and assert the type as 'number' for TypeScript (optional, but clean)
    const lat = rest.latitude as number;
    const lon = rest.longitude as number;

    // Initialize map
    this.map = L.map('map', {
      // 4. FIX APPLIED: 'lat' and 'lon' are now guaranteed to be numbers
      center: [lat, lon],
      zoom: 13
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Add a single marker
    L.marker([lat, lon], { icon: this.restaurantIcon })
      .addTo(this.map)
      .bindPopup(`<b>${rest.name}</b>`);

  } else {
    // Optional: Log an error or display a message if location data is missing
    console.error("Cannot initialize map: Missing or invalid coordinates for the restaurant.");
  }
}

  // ⭐️ NEW METHOD: Constructs the Google Maps URL and navigates
 navigateToGoogleMaps(
        lat: number | undefined | null,
        lon: number | undefined | null,
        name: string | undefined
    ): void {

        // 1. Validation Check: Ensure we have valid numeric coordinates
        if (typeof lat !== 'number' || typeof lon !== 'number') {
            console.error('Invalid coordinates for navigation. Cannot open Google Maps.');
            return;
        }

        // 2. Prepare URL components
        const restaurantName = name || 'Gourmet Kitchen';
        const encodedName = encodeURIComponent(restaurantName);

        // 3. Construct the Google Maps URL
        // Use the coordinates directly for the highest precision pin
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodedName}`;

        // 4. Open the URL in a new tab/window
        window.open(googleMapsUrl, '_blank');
    }

  // Helper method to generate the URL (using coordinates for precision)
  private getGoogleMapsUrl(lat: number, lon: number, name: string): string {
    // Use the /place/ URL for a direct pin, including the name as a query for better results
    const query = encodeURIComponent(name);
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${query}`;
    // A simpler alternative is: return `https://maps.google.com/?q=${lat},${lon}`;
  }


}
