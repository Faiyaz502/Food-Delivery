import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItemResponseDTO, CartResponseDTO, CartSummaryDTO, CheckoutDTO } from 'src/app/Models/cart/cart.models';
import { OrderResponseDTO } from 'src/app/Models/Order/order.models';
import { CartService } from 'src/app/services/Cart/cart.service';
import { OrderService } from 'src/app/services/Orders/order.service';
import { CouponService } from 'src/app/services/reviewAndCoupon/coupon.service';
import * as L from 'leaflet';
import { CouponApplyRequest } from 'src/app/Models/NotificationAndCoupon/coupon.model';
import { UserProfile } from 'src/app/Models/Users/profile.model';
import { UserProfileService } from 'src/app/services/UserServices/user-profile.service';
import { environment } from 'src/app/Envirment/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {

  showLocationPrompt: boolean = false;


  userId:number = environment.userId; //home 5
  user!: UserProfile;
  currentCart: CartResponseDTO | null = null;
  cartSummary: Partial<CartSummaryDTO & { deliveryFee: number }> = { subtotal: 0, tax: 0, total: 0, deliveryFee: 50 };
  cartItems: CartItemResponseDTO[] = [];

  deliveryForm: FormGroup;
  selectedCard: any | null = { id: 1, last4Digits: '4242', cardType: 'Visa', expiryDate: '12/26', holderName: 'John Doe' };

  couponCode: string = '';
  couponDiscount: number = 0;
  couponError: string = '';
  showCoupons: boolean = false;
  availableCoupons: any[] = [];

  isLoading: boolean = false;
  orderError: string = '';

  // This matches your UserProfileCreateDTO exactly
  updateProfile = {
    dateOfBirth: '',
    profileImageUrl: '',
    latitude: 0,
    longitude: 0
  };

  get finalTotal(): number {
    return (this.cartSummary.total || 0) + (this.cartSummary.deliveryFee || 0) - this.couponDiscount;
  }

  @ViewChild('modalMapRef', { static: false }) modalMapElement!: ElementRef;
  modalMap!: L.Map;
  modalMarker!: L.Marker;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private couponService: CouponService,
    private router: Router,
    private userService: UserProfileService
  ) {
    this.deliveryForm = this.fb.group({
      deliveryAddress: ['', Validators.required],
      deliveryLatitude: [0],
      deliveryLongitude: [0],
      deliveryType: ['STANDARD', Validators.required],
      specialInstructions: [''],
      deliveryFee: [50] ,
      discount : this.couponDiscount ,
      paymentMethod: [this.selectedCard ? 'CARD' : 'CASH_ON_DELIVERY', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load cart
    this.cartService.currentCart$.subscribe(cart => {
      this.currentCart = cart;
      this.cartItems = cart?.items || [];
      if (cart) {
        const tax = cart.subtotal * 0.1;
        this.cartSummary = {
          totalItems: cart.totalItems,
          subtotal: cart.subtotal,
          tax: tax,
          total: cart.subtotal + tax,
          deliveryFee: this.deliveryForm.value.deliveryFee
        };

      }
    });

    // Load coupons
    this.couponService.getAllCoupons(0, 5).subscribe(res => {
      this.availableCoupons = res.content || [];
    });

    // Load user profile → then init map
    this.userService.getUserProfileById(this.userId).subscribe({
      next: (res) => {
        this.user = res;
        console.log(res);

            if (!this.user.latitude || !this.user.longitude) {
      this.showLocationPrompt = true;
    }

        this.initModalMap();
      },
      error: () => {
        // Fallback if profile fails
        this.initModalMap();
      }
    });

    console.log(this.user.latitude,this.user.longitude);






  }

  applyCoupon() {
    this.couponError = '';
    this.couponDiscount = 0;

    const request: CouponApplyRequest = {
      couponCode: this.couponCode,
      orderAmount: this.cartSummary.total!
    };

    this.couponService.applyCoupon(request).subscribe({
      next: (response) => {
        this.couponDiscount = response.discountAmount;
        this.couponCode = response.couponCode;

              this.deliveryForm.patchValue({
        discount: this.couponDiscount
      });



      },
      error: () => {
        this.couponError = 'Invalid or expired coupon.';
      }
    });
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



    this.updateUserProfile();

    const checkoutData: CheckoutDTO = {
      ...this.deliveryForm.value,
      deliveryFee: this.deliveryForm.value.deliveryFee,
      priorityLevel: this.deliveryForm.value.deliveryType === 'EXPRESS' ? 10 : 5
    };

    console.log(checkoutData);


    this.cartService.checkout(this.userId, checkoutData).subscribe({
      next: (order: OrderResponseDTO) => {
        this.isLoading = false;
        console.log(order);

       

        this.navigateToTrack(order.id);




      },
      error: () => {
        this.isLoading = false;
        this.orderError = 'Order placement failed. Please try again.';
      }
    });
  }

  // 🗺️ Initialize or Re-initialize Map
  initModalMap(): void {
    const element = this.modalMapElement?.nativeElement;
    if (!element) return;

    if (this.modalMap) {
      this.modalMap.remove();
    }

    // Get coordinates with fallbacks
    let lat = this.deliveryForm.get('deliveryLatitude')?.value || this.user?.latitude || 23.8103;
    let lng = this.deliveryForm.get('deliveryLongitude')?.value || this.user?.longitude || 90.4125;

    // Ensure they are valid numbers
    lat = typeof lat === 'number' && !isNaN(lat) ? Number(lat.toFixed(6)) : 23.8103;
    lng = typeof lng === 'number' && !isNaN(lng) ? Number(lng.toFixed(6)) : 90.4125;

    this.modalMap = L.map(element, { center: [lat, lng], zoom: 15 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.modalMap);

    if (this.modalMarker) this.modalMap.removeLayer(this.modalMarker);
    this.modalMarker = L.marker([lat, lng]).addTo(this.modalMap);

    // Handle map clicks → round to 6 decimals
    this.modalMap.on('click', (e: any) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));

      this.deliveryForm.patchValue({ deliveryLatitude: lat, deliveryLongitude: lng });



      if (this.modalMarker) this.modalMap.removeLayer(this.modalMarker);
      this.modalMarker = L.marker([lat, lng]).addTo(this.modalMap);

      this.updateProfile.latitude = lat;
        this.updateProfile.longitude = lng;




    });

    setTimeout(() => this.modalMap?.invalidateSize(), 0);
  }

//  Allow location access
allowLocation() {
  this.showLocationPrompt = false;

  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy; // in meters
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log('📍 Raw coordinates:', lat, lng);
        console.log('🎯 Accuracy:', accuracy, 'meters');

        // Only trust if accuracy is < 50 meters (adjust as needed)
        if (accuracy > 100) {
          alert(`Location accuracy is low (${Math.round(accuracy)}m). For best results, try outdoors or on mobile with GPS.`);
        }

        // Round to 6 decimals for consistency
        const preciseLat = Number(lat.toFixed(8));
        const preciseLng = Number(lng.toFixed(8));

        console.log('✅ Final (6-digit):', preciseLat.toFixed(6), preciseLng.toFixed(6));

        this.deliveryForm.patchValue({
          deliveryLatitude: preciseLat,
          deliveryLongitude: preciseLng
        });




      },
      (error) => {
        console.error('Geolocation failed:', error);
        alert('Could not get location. Please allow access and try again.');
        this.showLocationPrompt = true;
      },
      options
    );
  } else {
    alert('Geolocation not supported.');
  }
}
  denyLocation() {
    this.showLocationPrompt = false;
    alert('Location access denied. Some features may not work accurately.');
    this.initModalMap(); // Initialize with fallback
  }


  updateUserProfile(){

        this.userService.updateUserProfile(this.userId, this.updateProfile).subscribe({
          next: () => this.initModalMap(),
          error: (err) => console.error('Profile update failed', err)
        });

  }

    navigateToTrack(id : number) {

    this.router.navigate(['main/trackOrder',id]);
  }







}
