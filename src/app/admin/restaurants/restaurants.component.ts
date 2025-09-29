import { MenuItemService } from './../../services/menu-item.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { ApiService } from 'src/app/services/api.service';
import 'leaflet-control-geocoder';

import * as L from 'leaflet';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent {

  @ViewChild('modalMapRef', { static: false }) modalMapElement!: ElementRef;
  restaurants: Restaurant[] = [];
  menuItems: MenuItem[] = [];
  selectedRestaurant: Restaurant | null = null;
  showCreateModal = false;
  showEditModal = false;
  showMenuModal = false;
  showAddMenuItem = false;
  showEditMenuItem = false;
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
  imageUrls: [''] // support multiple images
};




addImage() {
  this.currentRestaurant.imageUrls.push('');
}

removeImage(index: number) {
  this.currentRestaurant.imageUrls.splice(index, 1);
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

  constructor(private apiService: ApiService , private menuService :MenuItemService) {}

  ngOnInit() {
    this.loadRestaurants();



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
      this.restaurants = restaurants;

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

  saveRestaurant() {
    if (this.showEditModal) {
      this.apiService.updateRestaurant(this.currentRestaurant.id, this.currentRestaurant).subscribe((rest) => {
        this.loadRestaurants();
        this.closeModal();

        if (rest.latitude && rest.longitude) {
    this.map.setView([rest.latitude, rest.longitude], 15);
  }


      });
    } else {
      this.apiService.createRestaurant(this.currentRestaurant).subscribe(() => {
        this.loadRestaurants();
        this.closeModal();
      });
    }
  }

  saveMenuItem() {
    if (!this.selectedRestaurant) return;

    this.currentMenuItem.restaurantId = this.selectedRestaurant?.id ?? 0;


    if (this.showEditMenuItem) {
      this.menuService.updateMenu(this.currentMenuItem.id!, this.currentMenuItem).subscribe(() => {
        this.viewMenuItems(this.selectedRestaurant!);
        this.closeMenuItemModal();

      });
    } else {
      this.menuService.createMenuItem(this.currentMenuItem).subscribe(() => {
        this.viewMenuItems(this.selectedRestaurant!);
        this.closeMenuItemModal();
      });
    }
  }

closeModal() {
  this.showCreateModal = false;
  this.showEditModal = false;

  this.currentRestaurant = {
    name: '',
    address: '',
    rating: 0,
    owner_id: 0,
    latitude: 0,
    longitude: 0,
    deliveryFee: 0,
    minimumOrderAmount: 0,
    estimatedDeliveryTime: 0,
    droneDeliveryEnabled: false,
    maxDroneDeliveryWeight: 3,
    imageUrls: ['']
  };

  // Clean up map
  if (this.modalMarker) {
    this.modalMap?.removeLayer(this.modalMarker);
    this.modalMarker = null;
  }

  if (this.modalMap) {
    this.modalMap.remove(); // Properly destroy Leaflet map
    this.modalMap = undefined;
  }
}

    //Modal Map

    private marker: L.Marker | null = null;




  closeMenuModal() {
    this.showMenuModal = false;

    this.selectedRestaurant = null;
    this.menuItems = [];
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





}
