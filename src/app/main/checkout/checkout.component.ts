import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItemCreateDTO, CartItemResponseDTO, CartResponseDTO, CartSummaryDTO, CheckoutDTO } from 'src/app/Models/cart/cart.models';
import {  OrderResponseDTO } from 'src/app/Models/Order/order.models';
import { CartService } from 'src/app/services/Cart/cart.service';
import { OrderService } from 'src/app/services/Orders/order.service';
import { CouponService } from 'src/app/services/reviewAndCoupon/coupon.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {

  userId: number = 1; // DEMO USER ID
  currentCart: CartResponseDTO | null = null;
  cartSummary: Partial<CartSummaryDTO & { deliveryFee: number }> = { subtotal: 0, tax: 0, total: 0, deliveryFee: 75 };
  cartItems: CartItemResponseDTO[] = [];

  deliveryForm: FormGroup;
  selectedCard: any | null = { id: 1, last4Digits: '4242', cardType: 'Visa', expiryDate: '12/26', holderName: 'John Doe' }; // DEMO

  couponCode: string = '';
  couponDiscount: number = 0;
  couponError: string = '';
  showCoupons: boolean = false;
  availableCoupons: any[] = []; // DEMO COUPONS

  isLoading: boolean = false;
  orderError: string = '';

  get finalTotal(): number {
    return (this.cartSummary.total || 0) + (this.cartSummary.deliveryFee || 0) - this.couponDiscount;
  }

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private couponService: CouponService,
    private router: Router
  ) {
    this.deliveryForm = this.fb.group({
      deliveryAddress: ['', Validators.required],
      deliveryLatitude: [0],
      deliveryLongitude: [0],
      deliveryType: ['STANDARD', Validators.required],
      specialInstructions: [''],
      deliveryFee: [75] // Initial default fee
    });
  }

  ngOnInit(): void {
    // 1. Get Cart Details
    this.cartService.currentCart$.subscribe(cart => {
      this.currentCart = cart;
      this.cartItems = cart?.items || [];
      if (cart) {
        // Recalculate summary from service method
        const total = this.cartService.calculateCartTotal(cart);
        const tax = cart.subtotal * 0.1;
        this.cartSummary = {
          totalItems: cart.totalItems,
          subtotal: cart.subtotal,
          tax: tax,
          total: cart.subtotal + tax, // Total before delivery/coupon
          deliveryFee: this.deliveryForm.value.deliveryFee // Use form value for current fee
        };
      } else {
        this.router.navigate(['/']); // Redirect if cart is empty
      }
    });

    // 2. Load Coupons
    this.couponService.getAllCoupons(0, 5).subscribe(res => {
        this.availableCoupons = res.content || [];
    });
  }

  applyCoupon() {
    this.couponError = '';
    this.couponDiscount = 0;

    // DEMO METHOD: You must create the 'CouponApplyRequest' model.
    const request = {
        couponCode: this.couponCode,
        cartId: this.currentCart!.id,
        amount: this.cartSummary.total!
    };

    // this.couponService.applyCoupon(request).subscribe({
    //   next: (response) => {
    //     this.couponDiscount = response.discountAmount;
    //     this.couponCode = response.couponCode; // Ensure code is updated if applied successfully
    //   },
    //   error: (err) => {
    //     this.couponError = 'Invalid or expired coupon.';
    //     console.error('Coupon application failed:', err);
    //   }
    // });
  }

  selectCoupon(coupon: any) {
      this.couponCode = coupon.code;
      this.showCoupons = false;
      this.applyCoupon();
  }

  placeOrder() {
    if (this.deliveryForm.invalid || !this.currentCart) {
      this.orderError = 'Please check delivery details and ensure your cart is not empty.';
      return;
    }

    this.isLoading = true;
    this.orderError = '';

    const checkoutData: CheckoutDTO = {
      ...this.deliveryForm.value,
      deliveryFee: this.deliveryForm.value.deliveryFee,
      priorityLevel: this.deliveryForm.value.deliveryType === 'EXPRESS' ? 10 : 5 // Example logic
    };

    this.cartService.checkout(this.userId, checkoutData).subscribe({
      next: (order: OrderResponseDTO) => {
        this.isLoading = false;
        // Optionally pass the new order ID to a tracking page
        this.router.navigate(['/orders', order.orderNumber]);
      },
      error: (err) => {
        this.isLoading = false;
        this.orderError = 'Order placement failed. Please try again.';
        console.error('Checkout failed:', err);
      }
    });
  }

}
