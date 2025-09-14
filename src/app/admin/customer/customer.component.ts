import { Address } from './../../Models/Customer.models';
import { Component } from '@angular/core';
import { Customer } from 'src/app/Models/Customer.models';
import { Order } from 'src/app/Models/order.model';
import { User } from 'src/app/Models/user.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent {

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  customerOrders: Order[] = [];

  // Filter properties
  searchTerm: string = '';
  statusFilter: string = 'all';
  cityFilter: string = 'all';

  // Modal states
  showCustomerDetails: boolean = false;
  showAccountActions: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.apiService.getUsers().subscribe(users => {
      this.apiService.getOrders().subscribe(orders => {
        this.customers = users
          .filter(user => user.role === 'customer')
          .map(user => this.mapUserToCustomer(user, orders));
        this.filteredCustomers = [...this.customers];
      });
    });
  }

  mapUserToCustomer(user: User, orders: Order[]): Customer {
    const userOrders = orders.filter(order => order.user_id === user.id);
    const totalSpend = userOrders.reduce((sum, order) => sum + order.total_amount, 0);

    return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
    status: this.getRandomStatus(),
    city: this.getRandomCity(),
    total_orders: userOrders.length,
    total_spend: totalSpend,
    customer_type: this.getCustomerType(userOrders.length, totalSpend)


    };
  }

  getRandomStatus(): 'active' | 'suspended' | 'blocked' {
    const statuses: ('active' | 'suspended' | 'blocked')[] = ['active', 'suspended', 'blocked'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  getRandomCity(): string {
    const cities = ['Downtown', 'Midtown', 'Uptown', 'Suburbs', 'Business District'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  getCustomerType(orderCount: number, totalSpend: number): 'new' | 'regular' | 'VIP' {
    if (orderCount === 0) return 'new';
    if (orderCount >= 10 && totalSpend >= 200) return 'VIP';
    return 'regular';
  }

  applyFilters() {
    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          customer.phone.includes(this.searchTerm);

      const matchesStatus = this.statusFilter === 'all' || customer.status === this.statusFilter;
      const matchesCity = this.cityFilter === 'all' || customer.city === this.cityFilter;

      return matchesSearch && matchesStatus && matchesCity;
    });
  }

  viewCustomerDetails(customer: Customer) {
    this.selectedCustomer = customer;
    this.loadCustomerOrders(customer.id);
    this.showCustomerDetails = true;
  }

  loadCustomerOrders(customerId: number) {
    this.apiService.getOrders().subscribe(orders => {
      this.customerOrders = orders.filter(order => order.user_id === customerId);
    });
  }

  closeCustomerDetails() {
    this.showCustomerDetails = false;
    this.selectedCustomer = null;
    this.customerOrders = [];
  }

  toggleAccountActions() {
    this.showAccountActions = !this.showAccountActions;
  }

  updateCustomerStatus(status: 'active' | 'suspended' | 'blocked') {
    if (this.selectedCustomer) {
      this.selectedCustomer.status = status;
      // In a real app, you would call an API to update the status
      this.showAccountActions = false;
    }
  }

  resetPassword() {
    if (this.selectedCustomer) {
      // In a real app, you would call an API to send password reset
      alert(`Password reset link sent to ${this.selectedCustomer.email}`);
      this.showAccountActions = false;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getCustomerTypeColor(type: string): string {
    switch (type) {
      case 'VIP': return 'text-purple-600 bg-purple-100';
      case 'regular': return 'text-blue-600 bg-blue-100';
      case 'new': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }

}
}
