import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { MenuCategoryDto, MenuCategoryService } from 'src/app/services/restaurant/menu-category.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';

@Component({
  selector: 'app-restaurant-list',
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.scss']
})
export class RestaurantListComponent implements OnInit {
  //  categories = [
  //     { id: 'all', name: 'All', icon: 'fa-utensils' },
  //     { id: 'burger', name: 'Burger', icon: 'fa-hamburger' },
  //     { id: 'pizza', name: 'Pizza', icon: 'fa-pizza-slice' },
  //     { id: 'fast-food', name: 'Fast Food', icon: 'fa-fire' },
  //     { id: 'indian-food', name: 'Indian Food', icon: 'fa-pepper-hot' },
  //     { id: 'chinese-food', name: 'Chinese Food', icon: 'fa-bowl-rice' },
  //     { id: 'dessert', name: 'Dessert', icon: 'fa-ice-cream' },
  //     { id: 'coffee', name: 'Coffee', icon: 'fa-mug-hot' },
  //     { id: 'biriyani', name: 'Biriyani', icon: 'fa-drumstick-bite' },
  //     { id: 'grill', name: 'Grill', icon: 'fa-fire-alt' }
  //   ];

  categories!: MenuCategoryDto[];
  restaurants!: Restaurant[];
  allRestaurants!:Restaurant[];


  selectedCategory: string | null = 'All'; // default active





  constructor(private categoryService: MenuCategoryService, private restaurantService: RestaurantService, private route: ActivatedRoute) { }
  ngOnInit(): void {


    this.selectedCategory = this.route.snapshot.paramMap.get('category');

    if (this.selectCategory == null) { this.selectedCategory = 'All' };



    this.getAllCategory();

    this.getRestauratnByCategory();

    


  }


  getAllCategory() {

    this.categoryService.getAllCategories().subscribe((res) => {

      this.categories = res;
    })
  }

  selectCategory(categoryName: string): void {
    this.selectedCategory = categoryName;
    // Optional: emit event or trigger data fetch

    this.getRestauratnByCategory();
  }


  getRestauratnByCategory() {
  if (this.selectedCategory == 'All') {
    this.restaurantService.getRestaurants().subscribe((res) => {
      this.allRestaurants = res; // Keep original data
      this.restaurants = [...this.allRestaurants]; // Copy for filtering
      this.applyFilters();
    })
  } else {
    this.restaurantService.getRestaurantBycategoryName(this.selectedCategory!).subscribe((res) => {
      this.allRestaurants = res;
      this.restaurants = [...this.allRestaurants];
      this.applyFilters();
    })
  }
}


  //Add filtre

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
