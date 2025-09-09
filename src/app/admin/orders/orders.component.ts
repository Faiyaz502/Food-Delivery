import { Component } from '@angular/core';
import { Order } from 'src/app/Models/order.model';
import { Rider } from 'src/app/Models/rider.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {

   orders: Order[] = [];
  riders: Rider[] = [];
  availableRiders: Rider[] = [];
  selectedOrder: Order | null = null;
  showAssignRiderModal = false;
  pendingOrders = 0;
  inTransitOrders = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadOrders();
    this.loadRiders();
  }

  loadOrders() {
    this.apiService.getOrders().subscribe(orders => {
      this.orders = orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      this.pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
      this.inTransitOrders = orders.filter(o => o.status === 'in_transit').length;
    });
  }

  loadRiders() {
    this.apiService.getRiders().subscribe(riders => {
      this.riders = riders;
      this.availableRiders = riders.filter(rider => rider.availability);
    });
  }

  updateOrderStatus(orderId: number, event: any) {
    const newStatus = event.target.value;
    this.apiService.updateOrderStatus(orderId, newStatus).subscribe(() => {
      this.loadOrders();
    });
  }

  showRiderAssignment(order: Order) {
    this.selectedOrder = order;
    this.showAssignRiderModal = true;
  }

  assignRider(rider: Rider) {
    if (this.selectedOrder) {
      // In a real app, you would create a delivery record here
      console.log(`Assigning rider ${rider.id} to order ${this.selectedOrder.id}`);

      // Update order status to in_transit
      this.apiService.updateOrderStatus(this.selectedOrder.id, 'in_transit').subscribe(() => {
        this.loadOrders();
        this.closeAssignRiderModal();

        // Update rider availability
        this.apiService.updateRiderAvailability(rider.id, false).subscribe(() => {
          this.loadRiders();
        });
      });
    }
  }

  closeAssignRiderModal() {
    this.showAssignRiderModal = false;
    this.selectedOrder = null;
  }

}
