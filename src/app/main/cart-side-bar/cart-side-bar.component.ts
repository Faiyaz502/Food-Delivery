import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/app/Envirment/environment';
import { CartResponseDTO } from 'src/app/Models/cart/cart.models';
import { AuthServiceService } from 'src/app/services/authService/auth-service.service';
import { TokenService } from 'src/app/services/authService/token.service';

import { CartService } from 'src/app/services/Cart/cart.service';

@Component({
  selector: 'app-cart-side-bar',
  templateUrl: './cart-side-bar.component.html',
  styleUrls: ['./cart-side-bar.component.scss'],
})
export class CartSideBarComponent {
  @Input() isOpen: boolean = false;
  @Output() closeCartEvent = new EventEmitter<void>();

  cart: CartResponseDTO | null = null;

  userId: any; // HOme

  constructor(
    private cartService: CartService,
    private router: Router,
    private token: TokenService,
    private auth: AuthServiceService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.token.getId());
    // Load cart on component initialization (if not already loaded)
    this.cartService.getOrCreateCart(this.userId).subscribe();

    // Subscribe to currentCart$ for real-time updates
    this.cartService.currentCart$.subscribe((cart) => {
      this.cart = cart;
    });
  }

  closeCart() {
    this.closeCartEvent.emit();
    this.isOpen = !this.isOpen;
  }

  updateQuantity(cartItemId: number, quantity: number) {
    if (quantity > 0) {
      this.cartService
        .updateCartItemQuantity(this.userId, cartItemId, quantity)
        .subscribe({
          next: () => {
            if (!this.cart) return;

            //  Find the specific item and update only quantity
            const item = this.cart.items.find((i) => i.id === cartItemId);
            if (item) {
              item.quantity = quantity;

              //  Recalculate subtotal & total item count after update
              this.cart.subtotal = this.calculateSubtotal();
              this.cart.totalItems = this.calculateTotalItems();
            }
          },
          error: (err) => console.error('Failed to update cart item', err),
        });
    } else {
      this.removeItem(cartItemId);
    }
  }

  removeItem(cartItemId: number) {
    this.cartService.removeItemFromCart(this.userId, cartItemId).subscribe({
      error: (err) => console.error('Failed to remove cart item', err),
    });
  }

  navigateToCheckout() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/main/login']);
       this.closeCart();
      return;
    }


    this.router.navigate(['/main/checkout']);

    this.closeCart();
  }

  calculateSubtotal(): number {
    return this.cart!.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  }

  calculateTotalItems(): number {
    return this.cart!.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
