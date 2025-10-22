
import { fromEvent, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { Component, OnInit, ElementRef, ViewChild, Renderer2, EventEmitter, Output, HostListener } from '@angular/core';
import { User } from 'src/app/Models/Users/user.models';
import { CartService } from 'src/app/services/Orders/order.service';
import { MenuCategoryDto, MenuCategoryService } from 'src/app/services/restaurant/menu-category.service';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { MenuItemService } from 'src/app/services/menu-item.service';
import { MenuItem } from 'src/app/Models/MenuItem.model';

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


  constructor(
    private categoryService:MenuCategoryService,
    private restaurantService:RestaurantService,
    private menuItemsService: MenuItemService

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




}

