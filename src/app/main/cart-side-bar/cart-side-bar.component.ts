import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CartResponseDTO } from 'src/app/Models/cart/cart.models';

import { CartService } from 'src/app/services/Cart/cart.service';


@Component({
  selector: 'app-cart-side-bar',
  templateUrl: './cart-side-bar.component.html',
  styleUrls: ['./cart-side-bar.component.scss']
})
export class CartSideBarComponent {
@Input() isOpen: boolean = false;
  @Output() closeCartEvent = new EventEmitter<void>();

  cart: CartResponseDTO | null = null;
  // DEMO DATA - Replace with actual user/auth service subscription
  userId: number = 2;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    // Load cart on component initialization (if not already loaded)
    this.cartService.getOrCreateCart(this.userId).subscribe();

    // Subscribe to currentCart$ for real-time updates
    this.cartService.currentCart$.subscribe(cart => {
      this.cart = cart;
       
    });

   
    
  }

  closeCart() {
    this.closeCartEvent.emit();
    this.isOpen = !this.isOpen;
  }

  updateQuantity(cartItemId: number, quantity: number) {
    if (quantity > 0) {
      this.cartService.updateCartItemQuantity(this.userId, cartItemId, quantity).subscribe({
        error: (err) => console.error('Failed to update cart item', err)
      });
    } else {
      this.removeItem(cartItemId);
    }
  }

  removeItem(cartItemId: number) {
    this.cartService.removeItemFromCart(this.userId, cartItemId).subscribe({
      error: (err) => console.error('Failed to remove cart item', err)
    });
  }

  navigateToCheckout() {
    this.closeCart();
    this.router.navigate(['checkout']);
  }


}
