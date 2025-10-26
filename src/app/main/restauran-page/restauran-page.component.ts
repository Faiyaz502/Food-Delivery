import { ApiService } from './../../services/api.service';
import { Component, HostListener ,AfterViewInit, Input} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { ReviewResponse, RestaurantReviewSummary } from 'src/app/Models/NotificationAndCoupon/review.model';

import { Restaurant } from 'src/app/Models/restaurant.model';
import { Review } from 'src/app/Models/review.model';
import { MenuItemService } from 'src/app/services/menu-item.service';


import { MenuCategoryDto, MenuCategoryService } from 'src/app/services/restaurant/menu-category.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { ReviewService } from 'src/app/services/reviewAndCoupon/review.service';
import * as L from 'leaflet';
import { forkJoin, lastValueFrom, switchMap, tap } from 'rxjs';
import { CartService } from 'src/app/services/Cart/cart.service';
import { CartItemCreateDTO, CartResponseDTO } from 'src/app/Models/cart/cart.models';
import { environment } from 'src/app/Envirment/environment';




@Component({
  selector: 'app-restauran-page',
  templateUrl: './restauran-page.component.html',
  styleUrls: ['./restauran-page.component.scss']
})

export class RestauranPageComponent {

 
  userId = environment.userId; // home

    showClearCartOption: boolean = false;

  restaurantId!:number;
  restaurant!: Restaurant;
   categories!:MenuCategoryDto[];
  menuItems!: MenuItem[];


  fetchMenu!:MenuItem[];
   reviews!: ReviewResponse[];

   selectedCategory!:string ;

   CurrentCart: CartItemCreateDTO = {
  menuItemId: 0,
  quantity: 1
};




  constructor(
    private categoryService:MenuCategoryService,
    private restaurantService:RestaurantService,
    private menuItemsService: MenuItemService ,
    private reviewService : ReviewService ,
    private menucategoryService : MenuCategoryService,
    private route: ActivatedRoute ,
    private cartService:CartService

  ){}

   ngOnInit(): void {

           this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Restaurant ID:', this.restaurantId);

      this.loadData();







  }


loadData() {
  // Scroll to top immediately
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Make API calls in parallel and wait for both
  forkJoin({
    categories: this.categoryService.getCategoryByRestaurant(this.restaurantId),
    menuItems: this.menuItemsService.getMenuItemByRestaurant(this.restaurantId)
  }).subscribe({
    next: ({ categories, menuItems }) => {



      this.categories = categories;
      this.menuItems = menuItems;

      // ✅ Now safely select the first category
      if (this.categories.length > 0) {
        this.selectCategory(this.categories[0].name);
      }
    },
    error: (err) => console.error(err)
  });

  // Load restaurant and reviews separately
  this.getAllRestaurant();
  this.getAllReviewsById();
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

getAllCategoryByRestaurant() {
  this.categoryService.getCategoryByRestaurant(this.restaurantId).subscribe((res) => {
    this.categories = res;

    // ✅ Once categories are loaded, select the first one
    if (this.categories.length > 0) {
      this.selectCategory(this.categories[0].name);
    }
  });
}




getAllMenuItems() {
  this.menuItemsService.getMenuItemByRestaurant(this.restaurantId).subscribe((res) => {
    this.menuItems = res;

    // ✅ After menuItems are loaded, check if categories are already loaded
    if (this.categories && this.categories.length > 0 && !this.selectedCategory) {
      this.selectCategory(this.categories[0].name);
    }
  });
}



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

  /// Category tab

  selectCategory(categoryName: string) {
    this.selectedCategory = categoryName;

   this.fetchItems();
  }


  //fetch data acording category


fetchItems() {
 // reset the array

 this.fetchMenu = [];

 //fetch
  this.fetchMenu = this.menuItems.filter(
    (item) => item.catagoryName === this.selectedCategory
  );
}


//Cart Add

async addToCart(menuItemId: number): Promise<void> {
  // 1. Store the item the user is attempting to add
  this.CurrentCart.menuItemId = menuItemId;
  this.CurrentCart.quantity = 1;

  // 2. Begin the check/add process
  await this.checkAndAddToCart(menuItemId);
}

/**
 * Checks if the new item's restaurant matches the cart's existing items.
 * If not, shows the conflict modal.
 */
private async checkAndAddToCart(menuItemId: number): Promise<void> {
  try {
    // 💡 Get cart data using lastValueFrom for async/await pattern
    const cart: CartResponseDTO = await lastValueFrom(this.cartService.getOrCreateCart(this.userId));

    if (cart && cart.items && cart.items.length > 0) {
      // Find the full details of the menu item being added
      const newItemDetails = this.menuItems.find(item => item.id === menuItemId);

      if (!newItemDetails) {
        console.error('New menu item details not found.');
        alert('Error: Item not found in the menu.');
        return;
      }

      // Get the restaurant ID of the first item in the cart
      // Assuming all items in a valid cart have the same restaurant ID
      const existingRestId = cart.items[0].restaurantId;

      // Check for mismatch
      if (existingRestId !== newItemDetails.restaurantId) {
        // Mismatch detected! Show the warning modal.
        this.showClearCartOption = true;
        return; // Stop the function here, wait for user action on the modal
      }
    }

    // If cart is empty OR restaurant IDs match, proceed to add the item.
    this.proceedToAddItem(this.CurrentCart);

  } catch (error) {
    console.error('Error checking cart before adding item:', error);
    // Fallback: If cart check fails, proceed to add optimistically
    this.proceedToAddItem(this.CurrentCart);
  }
}


private proceedToAddItem(item: CartItemCreateDTO): void {
    // Get or create cart, then switch to adding the item
    this.cartService.getOrCreateCart(this.userId).pipe(
      switchMap(() => this.cartService.addItemToCart(this.userId, item)),
      tap({
        next: (updatedCart) => {
          console.log('Item added to cart:', updatedCart);
          alert('Item added to cart successfully!');
        },
        error: (err) => {
          console.error('Error adding item to cart:', err);
          alert('Error adding item to cart. Please try again.');
        }
      })
    ).subscribe();
  }


clearCartForMultiRestaurant(): void {
    // 1. Call the service to clear the user's cart
    this.cartService.clearCart(this.userId).pipe(
      tap({
        next: () => {
          // 2. Hide the modal on success
          this.showClearCartOption = false;

          // 3. Re-attempt to add the stored item
          alert(`Cart cleared successfully! Now adding the new item.`);
          this.proceedToAddItem(this.CurrentCart);
        },
        error: (err) => {
          console.error('Error clearing cart:', err);
          alert('Could not clear the cart. Please try again.');
          // Keep the modal open so the user can see the error or try again
        }
      })
    ).subscribe();
  }




}


