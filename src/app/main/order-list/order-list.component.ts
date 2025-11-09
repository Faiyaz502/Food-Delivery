import { Token } from '@angular/compiler';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { OrderResponseDTO, OrderStatus } from 'src/app/Models/Order/order.models';
import { PaginatedResponse } from 'src/app/Models/rider.model';
import { TokenService } from 'src/app/services/authService/token.service';
import { OrderService } from 'src/app/services/Orders/order.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent {
 orders: OrderResponseDTO[] = [];
  selectedOrder: OrderResponseDTO | null = null;
  isModalOpen: boolean = false;

  customerId : any;

  // Pagination State
  currentPage: number = 0; // 0-indexed
  pageSize: number = 4;
  totalPages: number = 0;
  totalElements: number = 0;
  isLoading: boolean = false;

  readonly completedStatuses: OrderStatus[] = ['DELIVERED', 'CANCELLED'];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private token : TokenService
  ) { }

  ngOnInit(): void {
    this.customerId = Number(this.token.getId());

    this.goToPage(0);
     // Load the first page when the component initializes

  }


  loadCustomerOrders(page: number, size: number): void {
    this.isLoading = true;
    this.orders = []; // Clear previous orders while loading

    console.log(this.orders);


 this.orderService.getOrdersByCustomermain(this.customerId, page, size)
  .subscribe({
    next: (response: PaginatedResponse<OrderResponseDTO>) => {



      this.orders = response.content;
      console.log(this.orders);

      this.currentPage = response.number;
      this.totalPages = response.totalPages;
      this.totalElements = response.totalElements;
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Failed to load orders:', err);
      this.isLoading = false;
    }
  });

  }



  /**
   * Navigates to the specified page index (0-indexed) if valid.
   * @param pageIndex The page index to navigate to.
   */

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages || pageIndex === 0 && this.totalPages === 0) {
      this.currentPage = pageIndex;
      this.loadCustomerOrders(this.currentPage, this.pageSize);
    }
  }

  /**
   * Determines if an order is eligible for tracking (not DELIVERED or CANCELLED).
   */
  isTrackable(orderStatus: OrderStatus): boolean {
    return !this.completedStatuses.includes(orderStatus);
  }

  /**
   * Navigates to the dedicated order tracking page.
   */
  trackOrder(orderId: number): void {
    this.router.navigate(['main/trackOrder', orderId]);
  }

  /**
   * Opens and populates the order details modal.
   */
  openDetailsModal(order: OrderResponseDTO): void {
    this.selectedOrder = order;
    this.isModalOpen = true;
  }

  /**
   * Closes the order details modal.
   */
  closeDetailsModal(): void {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }
}
