import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';


import { UserRole, UserStatus, VehicleType, AdminLevel } from 'src/app/Enums/profileEnums';
import { User,UserCreateDTO, UserUpdateDTO } from 'src/app/Models/Users/user.models';
import { AdminProfileService } from 'src/app/services/UserServices/admin-profile.service';
import { DeliveryPersonService } from 'src/app/services/UserServices/delivery-person.service';
import { RestaurantOwnerService } from 'src/app/services/UserServices/restaurant-owner.service';
import { UserProfileService } from 'src/app/services/UserServices/user-profile.service';
import { UserServiceService } from 'src/app/services/UserServices/user.service.service';


interface Stats {
  totalUsers: number;
  totalCustomers: number;
  totalDeliveryPersons: number;
  totalRestaurantOwners: number;
  totalAdmins: number;
  activeUsers: number;
  verifiedUsers: number;
}


@Component({
  selector: 'app-users',
  templateUrl:'./users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  selectedUserProfile: any = null;

  stats: Stats = {
    totalUsers: 0,
    totalCustomers: 0,
    totalDeliveryPersons: 0,
    totalRestaurantOwners: 0,
    totalAdmins: 0,
    activeUsers: 0,
    verifiedUsers: 0
  };

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  filterRole: UserRole | 'ALL' = 'ALL';
  filterStatus: UserStatus | 'ALL' = 'ALL';
  searchTerm = '';

  showUserModal = false;
  showCreateModal = false;
  showProfileModal = false;
  activeProfileTab = 'details';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  userRoles = Object.values(UserRole);
  userStatuses = Object.values(UserStatus);
  vehicleTypes = Object.values(VehicleType);
  adminLevels = Object.values(AdminLevel);

  newUser: UserCreateDTO = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    primaryRole: UserRole.CUSTOMER
  };

  customerProfile = {
    dateOfBirth: '',
    profileImageUrl: '',
    latitude:0 ,
     longitude : 0 
    
  };

  deliveryPersonProfile = {
    vehicleType: VehicleType.BIKE,
    drivingLicenseNumber: '',
    maxDeliveryRadius: 10
  };

  restaurantOwnerProfile = {
    businessLicenseNumber: '',
    bankAccountNumber: '',
    bankRoutingNumber: ''
  };

  adminProfile = {
    department: '',
    adminLevel: AdminLevel.JUNIOR,
    accessLevel: 1,
    supervisorId: undefined as number | undefined
  };

  editUser: UserUpdateDTO = {
    firstName: '',
    lastName: '',
    phoneNumber: '' ,
    profilePictureUrl: ''
  };

  constructor(
    private userService: UserServiceService,
    private userProfileService: UserProfileService,
    private deliveryPersonService: DeliveryPersonService,
    private restaurantOwnerService: RestaurantOwnerService,
    private adminProfileService: AdminProfileService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  loadStats(): void {
    forkJoin({
      allUsers: this.userService.getAllUsers(0, 1),
      customers: this.userService.getUsersByRole(UserRole.CUSTOMER, 0, 1),
      delivery: this.userService.getUsersByRole(UserRole.DELIVERY_PERSON, 0, 1),
      owners: this.userService.getUsersByRole(UserRole.RESTAURANT_OWNER, 0, 1),
      admins: this.userService.getUsersByRole(UserRole.ADMIN, 0, 1),
      active: this.userService.getUsersByStatus(UserStatus.ACTIVE, 0, 1)
    }).subscribe({
      next: (results) => {
        this.stats.totalUsers = results.allUsers.totalElements;
        this.stats.totalCustomers = results.customers.totalElements;
        this.stats.totalDeliveryPersons = results.delivery.totalElements;
        this.stats.totalRestaurantOwners = results.owners.totalElements;
        this.stats.totalAdmins = results.admins.totalElements;
        this.stats.activeUsers = results.active.totalElements;
        this.stats.verifiedUsers = this.users.filter(u => u.isVerified).length;
      },
      error: (error) => {
        console.error('Failed to load stats', error);
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.filterRole !== 'ALL') {
      this.userService.getUsersByRole(this.filterRole as UserRole, this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.users = response.content;
          this.filteredUsers = this.users;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
          this.applySearch();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load users';
          this.isLoading = false;
          console.error(error);
        }
      });
    } else if (this.filterStatus !== 'ALL') {
      this.userService.getUsersByStatus(this.filterStatus as UserStatus, this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.users = response.content;
          this.filteredUsers = this.users;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
          this.applySearch();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load users';
          this.isLoading = false;
          console.error(error);
        }
      });
    } else {
      this.userService.getAllUsers(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.users = response.content;
          this.filteredUsers = this.users;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
          this.applySearch();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load users';
          this.isLoading = false;
          console.error(error);
        }
      });
    }
  }

  applySearch(): void {
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phoneNumber.includes(term)
    );
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  onSearchChange(): void {
    this.applySearch();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  openCreateModal(): void {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      primaryRole: UserRole.CUSTOMER
    };
    this.resetProfileForms();
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetProfileForms(): void {
    this.customerProfile = {
      dateOfBirth: '',
      profileImageUrl: '',
      latitude:0 ,
     longitude : 0 
    
    };
    this.deliveryPersonProfile = {
      vehicleType: VehicleType.BIKE,
      drivingLicenseNumber: '',
      maxDeliveryRadius: 10
    };
    this.restaurantOwnerProfile = {
      businessLicenseNumber: '',
      bankAccountNumber: '',
      bankRoutingNumber: ''
    };
    this.adminProfile = {
      department: '',
      adminLevel: AdminLevel.JUNIOR,
      accessLevel: 1,
      supervisorId: undefined
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createUser(): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.userService.createUser(this.newUser).subscribe({
    next: (user) => {
      if (!user) {
        this.errorMessage = 'User creation failed: The User Already Exist';
        this.isLoading = false;
        this.closeUserModal();
        return;
      }
      this.createRoleProfile(user);
    },
    error: (error) => {
      // Show backend validation errors, e.g., duplicate email/phone
      if (error.status === 400 && error.error?.message) {
        this.errorMessage = error.error.message;
      } else {
        this.errorMessage = 'Failed to create user';
      }
      this.isLoading = false;
      console.error(error);
    }
  });
}

  createRoleProfile(user: User): void {
    switch (user.primaryRole) {
      case UserRole.CUSTOMER:
        if (this.customerProfile.dateOfBirth || this.customerProfile.profileImageUrl) {
          this.userProfileService.createUserProfile(user.id, this.customerProfile).subscribe({
            next: (s) => {
              console.log(s);

              this.successMessage = 'User and profile created successfully!';
              this.completeUserCreation();
            },
            error: (error) => {
              this.successMessage = 'User created, but profile creation failed';
              this.completeUserCreation();
            }
          });
        } else {
          this.successMessage = 'User created successfully!';
          this.completeUserCreation();
        }
        break;

      case UserRole.DELIVERY_PERSON:
        if (this.deliveryPersonProfile.drivingLicenseNumber) {
          this.deliveryPersonService.createDeliveryPerson(user.id, this.deliveryPersonProfile).subscribe({
            next: () => {
              this.successMessage = 'User and delivery profile created successfully!';
              this.completeUserCreation();
            },
            error: (error) => {
              this.successMessage = 'User created, but profile creation failed';
              this.completeUserCreation();
            }
          });
        } else {
          this.successMessage = 'User created successfully!';
          this.completeUserCreation();
        }
        break;

      case UserRole.RESTAURANT_OWNER:
        if (this.restaurantOwnerProfile.businessLicenseNumber) {
          this.restaurantOwnerService.createRestaurantOwner(user.id, this.restaurantOwnerProfile).subscribe({
            next: () => {
              this.successMessage = 'User and restaurant owner profile created successfully!';
              this.completeUserCreation();
            },
            error: (error) => {
              this.successMessage = 'User created, but profile creation failed';
              this.completeUserCreation();
            }
          });
        } else {
          this.successMessage = 'User created successfully!';
          this.completeUserCreation();
        }
        break;

      case UserRole.ADMIN:
        if (this.adminProfile.department) {
          this.adminProfileService.createAdminProfile(user.id, this.adminProfile).subscribe({
            next: () => {
              this.successMessage = 'User and admin profile created successfully!';
              this.completeUserCreation();
            },
            error: (error) => {
              this.successMessage = 'User created, but profile creation failed';
              this.completeUserCreation();
            }
          });
        } else {
          this.successMessage = 'User created successfully!';
          this.completeUserCreation();
        }
        break;
    }
  }

  completeUserCreation(): void {
    this.isLoading = false;
    this.closeCreateModal();
    this.loadUsers();
    this.loadStats();
  }

  openUserDetails(user: User): void {
    this.selectedUser = user;
    this.editUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber ,
      profilePictureUrl : user.imageUrl || ''
    };
    this.showUserModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  updateUser(): void {
    if (!this.selectedUser) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.userService.updateUser(this.selectedUser.id, this.editUser).subscribe({
      next: (user) => {
        this.successMessage = 'User updated successfully!';
        this.isLoading = false;
        this.closeUserModal();
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update user';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  updateUserStatus(userId: number, status: UserStatus): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.updateUserStatus(userId, status).subscribe({
      next: (user) => {
        this.successMessage = `User status updated to ${status}`;
        this.isLoading = false;
        this.loadUsers();
        this.loadStats();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update status';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  verifyUser(userId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.verifyUser(userId).subscribe({
      next: (user) => {
        this.successMessage = 'User verified successfully!';
        this.isLoading = false;
        this.loadUsers();
        this.loadStats();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to verify user';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.successMessage = 'User deleted successfully!';
        this.isLoading = false;
        this.loadUsers();
        this.loadStats();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete user';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  viewProfile(user: User): void {
    this.selectedUser = user;
    this.selectedUserProfile = null;
    this.activeProfileTab = 'details';
    this.showProfileModal = true;
    this.loadUserProfile(user);
  }

  loadUserProfile(user: User): void {
    this.isLoading = true;

    switch (user.primaryRole) {
      case UserRole.CUSTOMER:
        this.userProfileService.getUserProfileByUserId(user.id).subscribe({
          next: (profile) => {
            this.selectedUserProfile = profile;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Profile not found', error);
            this.isLoading = false;
          }
        });
        break;

      case UserRole.DELIVERY_PERSON:
        this.deliveryPersonService.getDeliveryPersonById(user.id).subscribe({
          next: (profile) => {
            this.selectedUserProfile = profile;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Profile not found', error);
            this.isLoading = false;
          }
        });
        break;

      case UserRole.RESTAURANT_OWNER:
        this.restaurantOwnerService.getRestaurantOwnerById(user.id).subscribe({
          next: (profile) => {
            this.selectedUserProfile = profile;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Profile not found', error);
            this.isLoading = false;
          }
        });
        break;

      case UserRole.ADMIN:
        this.adminProfileService.getAdminProfileByUserId(user.id).subscribe({
          next: (profile) => {
            this.selectedUserProfile = profile;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Profile not found', error);
            this.isLoading = false;
          }
        });
        break;
    }
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedUser = null;
    this.selectedUserProfile = null;
  }

  setProfileTab(tab: string): void {
    this.activeProfileTab = tab;
  }

  getRoleClass(role: UserRole): string {
    const classes: { [key in UserRole]: string } = {
      [UserRole.CUSTOMER]: 'role-customer',
      [UserRole.DELIVERY_PERSON]: 'role-delivery',
      [UserRole.RESTAURANT_OWNER]: 'role-restaurant',
      [UserRole.ADMIN]: 'role-admin'
    };
    return classes[role];
  }

  getStatusClass(status: UserStatus): string {
    const classes: { [key in UserStatus]: string } = {
      [UserStatus.ACTIVE]: 'status-active',
      [UserStatus.SUSPENDED]: 'status-suspended',
      [UserStatus.INACTIVE]: 'status-inactive',
      [UserStatus.BANNED]: 'status-banned'
    };
    return classes[status];
  }

  dismissMessage(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  get UserRole() {
    return UserRole;
  }
}
