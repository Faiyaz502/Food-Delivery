import { Router } from '@angular/router';
import { Component, HostListener } from '@angular/core';
import { CartService } from '../services/Cart/cart.service';
import { CartResponseDTO } from '../Models/cart/cart.models';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
isCartOpen = false;
  isProfileOpen = false;
  isLogin = false;

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) this.isProfileOpen = false;
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
    if (this.isProfileOpen) this.isCartOpen = false;
  }

  closeSidebars() {
    this.isCartOpen = false;
    this.isProfileOpen = false;
  }


    cart: CartResponseDTO | null = null;

    userId: number = 2; // TSP
    // userId: number = 5; // Home


    constructor(private cartService: CartService,private router: Router) {}

    ngOnInit(): void {
      // Load cart on component initialization (if not already loaded)
      this.cartService.getOrCreateCart(this.userId).subscribe();

      // Subscribe to currentCart$ for real-time updates
      this.cartService.currentCart$.subscribe(cart => {
        this.cart = cart;



      });


    }

          //restaurants
     goToRestaurants() {
    this.router.navigate(['/main/restaurantList/All']);
  }


  //Join button

    isJoinDropdownOpen = false;

  toggleJoinDropdown() {
    this.isJoinDropdownOpen = !this.isJoinDropdownOpen;
  }

  closeJoinDropdown() {
    this.isJoinDropdownOpen = false;
  }

  // Optional: Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.join-dropdown-container')) {
      this.closeJoinDropdown();
    }
  }

}
