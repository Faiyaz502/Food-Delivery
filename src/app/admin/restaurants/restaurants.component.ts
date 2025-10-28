import { MenuItemService } from './../../services/menu-item.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { ApiService } from 'src/app/services/api.service';
import 'leaflet-control-geocoder';

import * as L from 'leaflet';
import { MenuCategoryDto, MenuCategoryService } from 'src/app/services/restaurant/menu-category.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent {

  @ViewChild('modalMapRef', { static: false }) modalMapElement!: ElementRef;
  restaurants: Restaurant[] = [];
  menuItems: MenuItem[] = [];
  categories!: MenuCategoryDto[];
  selectedRestaurant: Restaurant | null = null;
  showCreateModal = false;
  showEditModal = false;
  showMenuModal = false;
  showAddMenuItem = false;
  showEditMenuItem = false;
   viewMode: 'grid' | 'list' | 'map' = 'grid';
  private restaurantMarkers: L.Marker[] = [];


private modalMap: L.Map | undefined;
private modalMarker: L.Marker | null = null;

currentRestaurant: any = {
  name: '',
  address: '',
  description:'',
  averageRating: 0,
  phoneNumber:0,
  email:'',
  ownerId: 1,
  latitude: 0,
  longitude: 0,
  deliveryFee: 40,
  minimumOrderAmount: 0,

};


  // ✅ New: for file uploads
  selectedRestaurantImageFiles: File[] = [];
  previewRestaurantImageUrls: string[] = [];

    // Menu item image upload
  selectedMenuItemImageFile: File | null = null;
  previewMenuItemImageUrl: string | null = null;

 onRestaurantImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedRestaurantImageFiles = Array.from(input.files);
      this.previewRestaurantImageUrls = [];
      this.selectedRestaurantImageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewRestaurantImageUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeRestaurantImage(index: number): void {
    this.selectedRestaurantImageFiles.splice(index, 1);
    this.previewRestaurantImageUrls.splice(index, 1);
  }

  private async uploadRestaurantImages(restaurantId: number): Promise<void> {
    if (this.selectedRestaurantImageFiles.length === 0) return;

    const formData = new FormData();
    this.selectedRestaurantImageFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      await this.apiService.uploadRestaurantImages(restaurantId, formData).toPromise();
    } catch (error) {
      console.error('Restaurant image upload failed', error);
      alert('Failed to upload restaurant images');
    }
  }

  // === MENU ITEM IMAGE HANDLERS ===


onMenuItemImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedMenuItemImageFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewMenuItemImageUrl = e.target.result;
    };
    reader.readAsDataURL(this.selectedMenuItemImageFile);
  }
}

// ✅ FIXED: Corrected method call and error handling
private async uploadMenuItemImage(menuItemId: number): Promise<void> {
  if (!this.selectedMenuItemImageFile) {
    console.log('No menu item image selected');
    return;
  }

  const formData = new FormData();
  formData.append('file', this.selectedMenuItemImageFile);

  try {
    console.log(`Uploading image for menu item ${menuItemId}...`);
    // ✅ FIXED: Use correct method name from MenuItemService
    await this.menuService.uploadMenuItemImage(menuItemId, formData).toPromise();
    console.log('Menu item image uploaded successfully');
  } catch (error) {
    console.error('Menu item image upload failed:', error);
    alert('Failed to upload menu item image. Please try again.');
    throw error; // Re-throw to handle in calling function
  }
}

// ✅ IMPROVED: Better error handling and flow
async saveMenuItem() {
  if (!this.selectedRestaurant) {
    alert('No restaurant selected');
    return;
  }

  this.currentMenuItem.restaurantId = this.selectedRestaurant.id ?? 0;

  try {
    if (this.showEditMenuItem) {
      // Update existing menu item
      await this.menuService.updateMenu(this.currentMenuItem.id!, this.currentMenuItem).toPromise();
      console.log('Menu item updated');

      // Upload image if selected
      if (this.selectedMenuItemImageFile) {
        await this.uploadMenuItemImage(this.currentMenuItem.id!);
      }

      this.viewMenuItems(this.selectedRestaurant!);
      this.closeMenuItemModal();
    } else {
      // Create new menu item
      const res = await this.menuService.createMenuItem(this.currentMenuItem).toPromise();
      console.log('Menu item created:', res);

      // Upload image if selected
      if (res && res.id && this.selectedMenuItemImageFile) {
        await this.uploadMenuItemImage(res.id);
      }

      this.viewMenuItems(this.selectedRestaurant!);
      this.closeMenuItemModal();
    }
  } catch (error) {
    console.error('Error saving menu item:', error);
    alert('Failed to save menu item. Please check console for details.');
  }
}

closeMenuItemModal() {
  this.showAddMenuItem = false;
  this.showEditMenuItem = false;
  this.currentMenuItem = {
    name: '',
    price: 0,
    description: '',
    imageUrl: '',
    isSpicy: false,
    spiceLevel: 0,
    preparationTime: 30,
    isAvailable: true,
    restaurantId: 0,
    catagoryName: ''
  };
  // ✅ Clear image selection
  this.selectedMenuItemImageFile = null;
  this.previewMenuItemImageUrl = null;
}
  // === SAVE METHODS ===
  saveRestaurant() {
    if (this.showEditModal) {
      this.apiService.updateRestaurant(this.currentRestaurant.id, this.currentRestaurant).subscribe(async (rest) => {
        await this.uploadRestaurantImages(rest.id!);
        this.loadRestaurants();
        this.closeModal();
        if (rest.latitude && rest.longitude) {
          this.map.setView([rest.latitude, rest.longitude], 15);
        }
      });
    } else {
      this.apiService.createRestaurant(this.currentRestaurant).subscribe(async (rest) => {
        await this.uploadRestaurantImages(rest.id!);
        this.loadRestaurants();
        this.closeModal();
      });
    }
  }



  // === MODAL HANDLERS ===
  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.currentRestaurant = {
      name: '',
      address: '',
      description: '',
      averageRating: 0,
      phoneNumber: '',
      email: '',
      ownerId: 1,
      latitude: 0,
      longitude: 0,
      deliveryFee: 40,
      minimumOrderAmount: 0,
      estimatedDeliveryTime: 0,
      droneDeliveryEnabled: false,
      maxDroneDeliveryWeight: 3,
    };
    this.selectedRestaurantImageFiles = [];
    this.previewRestaurantImageUrls = [];
    // ... map cleanup (keep your existing logic)

     if (this.modalMarker) {
    this.modalMap?.removeLayer(this.modalMarker);
    this.modalMarker = null;
  }

  if (this.modalMap) {
    this.modalMap.remove(); // Properly destroy Leaflet map
    this.modalMap = undefined;
  }
  }


 currentMenuItem: MenuItem = {
  name: '',
  price: 0,
  description: '',
  imageUrl: '',
  isSpicy: false,
  spiceLevel: 0,
  preparationTime: 30,
  isAvailable: true,
  restaurantId: 0,
  catagoryName: ''
};

  constructor(private apiService: ApiService , private menuService :MenuItemService,private menuCategoryService : MenuCategoryService) {}

  ngOnInit() {
    this.loadRestaurants();
    this.getAllCategorys();



  }
ngAfterViewChecked() {
  if ((this.showCreateModal || this.showEditModal) && this.modalMapElement && !this.modalMap) {
    this.initModalMap();
  }
}

openCreateModal() {
  this.showCreateModal = true;

}



  loadRestaurants() {
    this.apiService.getRestaurants().subscribe(restaurants => {
           this.allRestaurants = restaurants; // Keep original data
      this.restaurants = [...this.allRestaurants]; // Copy for filtering
      this.applyFilters();

        this.refreshMarkers();

    });
  }

  viewMenuItems(restaurant: Restaurant) {
    this.selectedRestaurant = restaurant;
    this.menuService.getMenuItemsByRestaurant(restaurant.id || 0).subscribe(items => {
      console.log(items);

      this.menuItems = items;
      this.showMenuModal = true;


    });
  }

  editRestaurant(restaurant: Restaurant) {
    this.currentRestaurant = { ...restaurant };
    this.showEditModal = true;


  }

  deleteRestaurant(id: number) {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      this.apiService.deleteRestaurant(id).subscribe(() => {
        this.loadRestaurants();
      });
    }
  }

  editMenuItem(item: MenuItem) {
    this.currentMenuItem = { ...item };
    this.showEditMenuItem = true;

  }

  deleteMenuItem(id: number) {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.menuService.delete(id).subscribe(() => {
        if (this.selectedRestaurant) {
          this.viewMenuItems(this.selectedRestaurant);
        }
      });
    }
  }




  //fetch Category Data

  getAllCategorys(){
        this.menuCategoryService.getAllCategories().subscribe((res)=>{

            this.categories = res ;

        })


  }






    //Modal Map

    private marker: L.Marker | null = null;




  closeMenuModal() {
    this.showMenuModal = false;

    this.selectedRestaurant = null;
    this.menuItems = [];
  }

  //varify



  verifyRestaurant(id: number, status: string) {
  if (!confirm(`Are you sure you want to mark this restaurant as ${status.toLowerCase()}?`)) {
    return;
  }

  this.apiService.verifyRestaurant(id, status).subscribe({
    next: (updatedRestaurant) => {
      // Update the local restaurant list with the new status
      const index = this.restaurants.findIndex(r => r.id === id);
      if (index !== -1) {
        this.restaurants[index] = updatedRestaurant;
      }
      alert('Restaurant status updated successfully!');
    },
    error: (err) => {
      console.error('Verification failed', err);
      alert('Failed to update restaurant status. Please try again.');
    }
  });
}

getStatusClass(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
    case 'SUSPENDED': return 'bg-red-100 text-red-800';
    case 'REJECTED': return 'bg-gray-100 text-gray-800';
    case 'INACTIVE': return 'bg-blue-100 text-blue-800';
    case 'CLOSED': return 'bg-black text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
}



  //map


 private map!: L.Map;


  // Custom restaurant icon
  restaurantIcon = L.icon({
    iconUrl: 'assets/img/restLocation.png',
    iconSize: [40, 40],       // icon size
    iconAnchor: [20, 40],     // point of icon which is on the marker position
    popupAnchor: [0, -40]     // popup appears above icon
  });

  ngAfterViewInit(): void {
    this.initMap();
  }

 private initMap(): void {
  // Initialize map
  this.map = L.map('map', {
    center: [23.8103, 90.4125], // Dhaka center
    zoom: 13
  });

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(this.map);

  // Wait for restaurants to load
  this.apiService.getRestaurants().subscribe(restaurants => {
    this.restaurants = restaurants;

    // Add markers for each restaurant
    this.restaurants.forEach(rest => {
      if (rest.latitude && rest.longitude) {
        L.marker([rest.latitude, rest.longitude], { icon: this.restaurantIcon })
          .addTo(this.map)
          .bindPopup(`<b>${rest.name}</b>`);
      }
    });
  });
}



  ///LatLang MAP



initModalMap(): void {
  const element = this.modalMapElement.nativeElement;

  // Safety check
  if (!element || this.modalMap) return;

  this.modalMap = L.map(element, {
    center: [this.currentRestaurant.latitude || 23.8103, this.currentRestaurant.longitude || 90.4125],
    zoom: this.currentRestaurant.latitude ? 15 : 13
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(this.modalMap);

  // Handle click to set location
  this.modalMap.on('click', (e: any) => {
    const { lat, lng } = e.latlng;
    this.currentRestaurant.latitude = lat;
    this.currentRestaurant.longitude = lng;

    if (this.modalMarker) {
      this.modalMap!.removeLayer(this.modalMarker);
    }
    this.modalMarker = L.marker([lat, lng]).addTo(this.modalMap!);
  });

  // If editing, show existing marker
  if (this.currentRestaurant.latitude && this.currentRestaurant.longitude) {
    if (this.modalMarker) {
      this.modalMap.removeLayer(this.modalMarker);
    }
    this.modalMarker = L.marker([this.currentRestaurant.latitude, this.currentRestaurant.longitude]).addTo(this.modalMap);
    this.modalMap.setView([this.currentRestaurant.latitude, this.currentRestaurant.longitude], 15);
  }

  // Force size recalc (sometimes needed)
  setTimeout(() => {
    this.modalMap?.invalidateSize();
  }, 0);
}

//Render map

private refreshMarkers() {
  // Remove all existing markers
  this.restaurantMarkers.forEach(marker => this.map.removeLayer(marker));
  this.restaurantMarkers = [];

  // Add markers from current restaurants array
  this.restaurants.forEach(rest => {
    if (rest.latitude && rest.longitude) {
      const marker = L.marker([rest.latitude, rest.longitude], { icon: this.restaurantIcon })
        .addTo(this.map)
        .bindPopup(`<b>${rest.name}</b>`);
      this.restaurantMarkers.push(marker);
    }
  });
}

//apply filter

  allRestaurants!:Restaurant[];
  fitreRestaurant!: Restaurant[];

  filter = {
    name: ''
  }

  onFilterChange(): void {
    this.applyFilters();
  }



applyFilters(): void {
  let filtered = [...this.allRestaurants]; // Always filter from original

  if (this.filter.name) {
    const query = this.filter.name.toLowerCase();
    filtered = filtered.filter(o =>
      o.name.toLowerCase().includes(query)
    );
  }

  this.restaurants = filtered;
}
clearFilters(): void {
  this.filter.name = '';
  this.applyFilters();
}




}
