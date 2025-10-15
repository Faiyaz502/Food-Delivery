import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserProfile, UserProfileCreateDTO } from 'src/app/Models/Users/profile.model';
import { User, PaginatedResponse } from 'src/app/Models/Users/user.models';
import { CustomerTier, UserRole, UserStatus } from 'src/app/Enums/profileEnums';
import { UserProfileService } from 'src/app/services/UserServices/user-profile.service';
import { UserServiceService } from 'src/app/services/UserServices/user.service.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent {
  Math = Math;
 customers: UserProfile[] = [];
  users: User[] = [];
  selectedCustomer: UserProfile | null = null;
  selectedUser: User | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Filter options
  filterType: 'all' | 'tier' | 'minOrders' | 'topOrders' | 'topSpending' = 'all';
  selectedTier: CustomerTier = CustomerTier.BRONZE;
  minOrders = 5;
  topLimit = 10;

  // Sorting
  sortBy = 'totalOrders';
  sortDir = 'DESC';

  // UI State
  isLoading = false;
  showModal = false;
  showEditModal = false;
  showLoyaltyModal = false;
  modalType: 'view' | 'edit' | 'loyalty' = 'view';

  // Forms
  profileForm: FormGroup;
  loyaltyForm: FormGroup;

  // Enums for template
  CustomerTier = CustomerTier;
  customerTiers = Object.values(CustomerTier);

  // Stats
  customerStats: any = null;

  constructor(
    private userProfileService: UserProfileService,
    private userService: UserServiceService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      dateOfBirth: [''],
      profileImageUrl: ['', [Validators.pattern('https?://.+')]]
    });

    this.loyaltyForm = this.fb.group({
      points: [0, [Validators.required, Validators.min(1)]],
      action: ['add', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;

    switch (this.filterType) {
      case 'tier':
        this.loadByTier();
        break;
      case 'minOrders':
        this.loadByMinOrders();
        break;
      case 'topOrders':
        this.loadTopByOrders();
        break;
      case 'topSpending':
        this.loadTopBySpending();
        break;
      default:
        this.loadAllCustomers();
    }
  }

  loadAllCustomers(): void {
    this.userProfileService.getAllUserProfiles(this.currentPage, this.pageSize, this.sortBy, this.sortDir)
      .subscribe({
        next: (response: PaginatedResponse<UserProfile>) => {

          console.log(response);

          this.customers = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading customers:', error);
          this.isLoading = false;
        }
      });
  }

  loadByTier(): void {
    this.userProfileService.getCustomersByTier(this.selectedTier, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PaginatedResponse<UserProfile>) => {
          this.customers = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading customers by tier:', error);
          this.isLoading = false;
        }
      });
  }

  loadByMinOrders(): void {
    this.userProfileService.getCustomersWithMinimumOrders(this.minOrders, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PaginatedResponse<UserProfile>) => {
          this.customers = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading customers by min orders:', error);
          this.isLoading = false;
        }
      });
  }

  loadTopByOrders(): void {
    this.userProfileService.getTopCustomersByOrders(this.topLimit)
      .subscribe({
        next: (customers: UserProfile[]) => {
          this.customers = customers;
          this.totalElements = customers.length;
          this.totalPages = 1;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading top customers by orders:', error);
          this.isLoading = false;
        }
      });
  }

  loadTopBySpending(): void {
    this.userProfileService.getTopCustomersBySpending(this.topLimit)
      .subscribe({
        next: (customers: UserProfile[]) => {
          this.customers = customers;
          this.totalElements = customers.length;
          this.totalPages = 1;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading top customers by spending:', error);
          this.isLoading = false;
        }
      });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadCustomers();
  }

  onSortChange(): void {
    this.currentPage = 0;
    this.loadCustomers();
  }

  viewCustomer(customer: UserProfile): void {
    this.selectedCustomer = customer;
    this.modalType = 'view';
    this.showModal = true;
    this.loadUserDetails(customer.userId);
    this.loadCustomerStats(customer.id);
  }

  editCustomer(customer: UserProfile): void {
    this.selectedCustomer = customer;
    this.modalType = 'edit';
    this.showEditModal = true;
    this.profileForm.patchValue({
      dateOfBirth: customer.dateOfBirth || '',
      profileImageUrl: customer.profileImageUrl || ''
    });
  }

  manageLoyalty(customer: UserProfile): void {
    this.selectedCustomer = customer;
    this.modalType = 'loyalty';
    this.showLoyaltyModal = true;
    this.loyaltyForm.reset({ points: 0, action: 'add' });
  }

  loadUserDetails(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        this.selectedUser = user;
      },
      error: (error) => {
        console.error('Error loading user details:', error);
      }
    });
  }

  loadCustomerStats(profileId: number): void {
    this.userProfileService.getCustomerStats(profileId).subscribe({
      next: (stats) => {
        this.customerStats = stats;
      },
      error: (error) => {
        console.error('Error loading customer stats:', error);
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.selectedCustomer) {
      const profileData: UserProfileCreateDTO = this.profileForm.value;

      this.userProfileService.updateUserProfile(this.selectedCustomer.id, profileData)
        .subscribe({
          next: (updatedProfile) => {
            const index = this.customers.findIndex(c => c.id === updatedProfile.id);
            if (index !== -1) {
              this.customers[index] = updatedProfile;
            }
            this.closeEditModal();
            alert('Profile updated successfully!');
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
          }
        });
    }
  }

  updateLoyaltyPoints(): void {
    if (this.loyaltyForm.valid && this.selectedCustomer) {
      const { points, action } = this.loyaltyForm.value;
      const observable = action === 'add'
        ? this.userProfileService.addLoyaltyPoints(this.selectedCustomer.id, points)
        : this.userProfileService.deductLoyaltyPoints(this.selectedCustomer.id, points);

      observable.subscribe({
        next: (updatedProfile) => {
          const index = this.customers.findIndex(c => c.id === updatedProfile.id);
          if (index !== -1) {
            this.customers[index] = updatedProfile;
          }
          this.closeLoyaltyModal();
          alert(`Loyalty points ${action === 'add' ? 'added' : 'deducted'} successfully!`);
        },
        error: (error) => {
          console.error('Error updating loyalty points:', error);
          alert('Failed to update loyalty points');
        }
      });
    }
  }

  deleteCustomer(customer: UserProfile): void {
    if (confirm(`Are you sure you want to delete this customer profile?`)) {
      this.userProfileService.deleteUserProfile(customer.id).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.id !== customer.id);
          alert('Customer profile deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
          alert('Failed to delete customer profile');
        }
      });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCustomers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCustomers();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadCustomers();
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCustomer = null;
    this.selectedUser = null;
    this.customerStats = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedCustomer = null;
    this.profileForm.reset();
  }

  closeLoyaltyModal(): void {
    this.showLoyaltyModal = false;
    this.selectedCustomer = null;
    this.loyaltyForm.reset();
  }

  getTierColor(tier: CustomerTier): string {
    switch (tier) {
      case CustomerTier.PLATINUM:
        return 'bg-gray-300 text-gray-800';
      case CustomerTier.GOLD:
        return 'bg-yellow-400 text-yellow-900';
      case CustomerTier.SILVER:
        return 'bg-gray-400 text-gray-900';
      case CustomerTier.BRONZE:
        return 'bg-orange-400 text-orange-900';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
