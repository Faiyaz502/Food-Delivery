
import { fromEvent, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { Component, OnInit, ElementRef, ViewChild, Renderer2, EventEmitter, Output, HostListener } from '@angular/core';
import { User } from 'src/app/Models/Users/user.models';

import { MenuCategoryDto, MenuCategoryService } from 'src/app/services/restaurant/menu-category.service';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { MenuItemService } from 'src/app/services/menu-item.service';
import { MenuItem } from 'src/app/Models/MenuItem.model';
import { Router } from '@angular/router';

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
export class HomeComponent implements OnInit {
    isFavorite = false;
  categories!:MenuCategoryDto[];
  restaurants!: Restaurant[];
  menuItems!: MenuItem[];
  isLogin = false ;


  constructor(
    private categoryService:MenuCategoryService,
    private restaurantService:RestaurantService,
    private menuItemsService: MenuItemService,
    private router: Router

  ){}



  ngOnInit(): void {
    this.getAllCategory();
    this.getAllRestaurant();
    this.getAllMenuItems();
  }


  getAllCategory(){

    this.categoryService.getAllCategories().subscribe((res)=>{

        this.categories = res ;
    })
  }

  getAllRestaurant(){

    this.restaurantService.getRestaurants().subscribe((res)=>{

      this.restaurants = res ;

    })
  }

  getAllMenuItems(){

    this.menuItemsService.getAllMenuItems().subscribe((res)=>{

      this.menuItems = res ;

      console.log(res);



    })


  }

      //restaurant
     goToRestaurant(id: number) {
    this.router.navigate(['/main/restaurant', id]);
  }
      //restaurants
     goToRestaurants(category:string) {
    this.router.navigate(['/main/restaurantList/',category]);
  }


  toggleFavorite(restaurant: any, event: MouseEvent) {
    event.stopPropagation(); // 👈 stops the card click event
    console.log('Favorite toggled:', restaurant);
    // Add logic to toggle favorite here
  }


  //delivery Area
  deliveryAreas = [
  {
    name: 'Dhaka',
    imageUrl: 'https://images.unsplash.com/photo-1706640254398-3b04782e8c76?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774'
  },
  {
    name: 'Chittagong',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1661900538689-e2c25124aa35?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=995'
  },
  {
    name: 'Sylhet',
    imageUrl: 'https://images.unsplash.com/photo-1637424505771-aaa974a70a3d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=393'
  },
  {
    name: 'Tangail',
    imageUrl: 'https://images.unsplash.com/photo-1708542536156-79afbf85ed69?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1032'
  },
  {
    name: 'Rajshahi',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1694475439235-0a0306a7477b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=894'
  },
  {
    name: 'Khulna',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1676487748067-4da1e9afa701?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870'
  },

];




}

