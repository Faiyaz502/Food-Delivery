import { Component } from '@angular/core';
import { MenuItem } from 'src/app/Models/menu-item.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { ApiService } from 'src/app/services/api.service';
import 'leaflet-control-geocoder';

import * as L from 'leaflet'

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent {
  restaurants: Restaurant[] = [];
  menuItems: MenuItem[] = [];
  selectedRestaurant: Restaurant | null = null;
  showCreateModal = false;
  showEditModal = false;
  showMenuModal = false;
  showAddMenuItem = false;
  showEditMenuItem = false;



  currentRestaurant: any = {
    name: '',
    address: '',
    rating: 0,
    owner_id: 0 ,
    image_url : ''
  };

  currentMenuItem: any = {
    restaurant_id: 0,
    name: '',
    price: 0,
    description: '',
    image_url: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadRestaurants();



  }

  loadRestaurants() {
    this.apiService.getRestaurants().subscribe(restaurants => {
      this.restaurants = restaurants;

    });
  }

  viewMenuItems(restaurant: Restaurant) {
    this.selectedRestaurant = restaurant;
    this.apiService.getMenuItemsByRestaurant(restaurant.id).subscribe(items => {
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
      this.apiService.deleteMenuItem(id).subscribe(() => {
        if (this.selectedRestaurant) {
          this.viewMenuItems(this.selectedRestaurant);
        }
      });
    }
  }

  saveRestaurant() {
    if (this.showEditModal) {
      this.apiService.updateRestaurant(this.currentRestaurant.id, this.currentRestaurant).subscribe(() => {
        this.loadRestaurants();
        this.closeModal();
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

    this.currentMenuItem.restaurant_id = this.selectedRestaurant.id;

    if (this.showEditMenuItem) {
      this.apiService.updateMenuItem(this.currentMenuItem.id, this.currentMenuItem).subscribe(() => {
        this.viewMenuItems(this.selectedRestaurant!);
        this.closeMenuItemModal();
      });
    } else {
      this.apiService.createMenuItem(this.currentMenuItem).subscribe(() => {
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
      owner_id: 0
    };
  }

  closeMenuModal() {
    this.showMenuModal = false;
    this.selectedRestaurant = null;
    this.menuItems = [];
  }

  closeMenuItemModal() {
    this.showAddMenuItem = false;
    this.showEditMenuItem = false;
    this.currentMenuItem = {
      restaurant_id: 0,
      name: '',
      price: 0,
      description: '',
      image_url: ''
    };
  }

  //map

  
 private map!: L.Map;

  // Example restaurant data
  restLoc = [
    { lat: 23.8156, lng: 90.4253, name: 'Pizza Place' },
    { lat: 23.8021, lng: 90.4168, name: 'Burger Spot' },
    { lat: 23.8222, lng: 90.4091, name: 'Sushi Corner' }
  ];

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
      center: [23.8103, 90.4125], // Example: Dhaka
      zoom: 13
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Add markers for each restaurant
    this.restLoc.forEach(rest => {
      L.marker([rest.lat, rest.lng], { icon: this.restaurantIcon })
        .addTo(this.map)
        .bindPopup(`<b>${rest.name}</b>`);
    });
  }



}
