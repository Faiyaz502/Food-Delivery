
import { fromEvent, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { Component, OnInit, ElementRef, ViewChild, Renderer2, EventEmitter, Output } from '@angular/core';
import { User } from 'src/app/Models/Users/user.models';
import { CartService } from 'src/app/services/Orders/order.service';

// Define the structure for a carousel item
interface CarouselItem {
  id: number;
  image: string;
  title: string;
  topic: string;
  des: string;
  detailTitle: string;
  detailDes: string;
  specifications: { label: string, value: string }[];
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
@Output() toggleLeftSidebarEvent = new EventEmitter<void>();
  @Output() toggleCartSidebarEvent = new EventEmitter<void>();

  cartItemCount: number = 0;
  // DEMO DATA - Replace with actual user/auth service subscription
  user: Partial<User> = {
    profilePictureUrl: 'https://via.placeholder.com/150/ff0000/ffffff?text=JD'
  };

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Subscribe to cart changes to update the count
    this.cartService.currentCart$.subscribe(cart => {
      this.cartItemCount = cart?.totalItems || 0;
    });
  }

  toggleLeftSidebar() {
    this.toggleLeftSidebarEvent.emit();
  }

  toggleCartSidebar() {
    this.toggleCartSidebarEvent.emit();
  }
}
