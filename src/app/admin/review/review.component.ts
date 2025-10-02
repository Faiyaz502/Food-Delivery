import { filter } from 'rxjs/operators';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { Review } from 'src/app/Models/review.model';
import { ApiService } from 'src/app/services/api.service';
import { User } from 'src/app/Models/Users/user.models';
interface ReviewWithDetails extends Review {
  user_name?: string;
  restaurant_name?: string;
  restaurant_image?: string;
  is_flagged?: boolean;
  status?: 'approved' | 'pending' | 'rejected';
}
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {

  reviews: ReviewWithDetails[] = [];
  filteredReviews: ReviewWithDetails[] = [];
  users: User[] = [];
  restaurants: Restaurant[] = [];

  // Filter properties
  ratingFilter: number = 0;
  dateFilter: string = '';
  userFilter: string = 'all';
  restaurantFilter: string = 'all';
  statusFilter: string = 'all';

  // View modes
  currentView: 'list' | 'flagged' | 'trends' = 'list';

  // Chart data for trends
  chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    ratings: [4.2, 4.3, 4.1, 4.4, 4.5, 4.3]
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();

  }

  loadData() {
    // Load users, restaurants, and reviews
    this.apiService.getUsers().subscribe(users => {
      this.users = users;

      this.apiService.getRestaurants().subscribe(restaurants => {
        this.restaurants = restaurants;

        this.apiService.getReviews().subscribe(reviews => {
          this.reviews = reviews.map(review => this.enrichReview(review));
          this.filteredReviews = [...this.reviews];

          this.createReviewChart()
        });


      });
    });

     ;
  }

  enrichReview(review: Review): ReviewWithDetails {
    const user = this.users.find(u => u.id === review.user_id);
    const restaurant = this.restaurants.find(r => r.id === review.restaurant_id);

    return {
      ...review,
      user_name: user?.firstName || 'Unknown User',
      restaurant_name: restaurant?.name || 'Unknown Restaurant',
      restaurant_image: restaurant?.image_url,
      is_flagged: Math.random() > 0.8, // Random flagged status for demo
      status: Math.random() > 0.3 ? 'approved' : 'pending' // Random status for demo
    };
  }

  applyFilters() {
    this.filteredReviews = this.reviews.filter(review => {
      const matchesRating = this.ratingFilter === 0 || review.rating === this.ratingFilter;
      const matchesUser = this.userFilter === 'all' || review.user_id.toString() === this.userFilter;
      const matchesRestaurant = this.restaurantFilter === 'all' || review.restaurant_id.toString() === this.restaurantFilter;
      const matchesStatus = this.statusFilter === 'all' || review.status === this.statusFilter;

      let matchesDate = true;
      if (this.dateFilter) {
        const reviewDate = new Date(review.created_at).toISOString().split('T')[0];
        matchesDate = reviewDate === this.dateFilter;
      }

      return matchesRating && matchesUser && matchesRestaurant && matchesStatus && matchesDate;
    });
  }

  setView(view: 'list' | 'flagged' | 'trends') {
    this.currentView = view;
    if (view === 'flagged') {
      this.filteredReviews = this.reviews.filter(review => review.is_flagged);
    } else if (view === 'list') {
      this.applyFilters();
    }
  }

  approveReview(review: ReviewWithDetails) {
    review.status = 'approved';
    // In a real app, call API to update review status
  }

  rejectReview(review: ReviewWithDetails) {
    review.status = 'rejected';
    // In a real app, call API to update review status
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getRatingColor(rating: number): string {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  }


  // chart

  @ViewChild('reviewChart') reviewsChart! : ElementRef ;

  // selectedYear = new Date().getFullYear;
  // selectedMonth = new Date().getMonth ;
  // availableYears = [2024,2025];
  // availableMonths = [
  //     { value: 1, name: 'January' },
  //     { value: 2, name: 'February' },
  //     { value: 3, name: 'March' },
  //     { value: 4, name: 'April' },
  //     { value: 5, name: 'May' },
  //     { value: 6, name: 'June' },
  //     { value: 7, name: 'July' },
  //     { value: 8, name: 'August' },
  //     { value: 9, name: 'September' },
  //     { value: 10, name: 'October' },
  //     { value: 11, name: 'November' },
  //     { value: 12, name: 'December' }
  //   ];


    // FilteredReviewsYr! : Review[] ;


  //   getReviewsbyYear(year : string ){
  //     this.apiService.getReviews().subscribe(reviews => {
  //   const filtered = reviews.filter(
  //     x => new Date(x.created_at).getFullYear() === +year
  //   );

  //   this.FilteredReviewsYr = filtered; // store in a component variable
  // });
  //   }




        createReviewChart() {
          if (!this.reviewsChart) return;

        //  const reviewByMonth = Array(12).fill(0);

        //   this.FilteredReviewsYr.forEach(x => {

        //     const month = new Date(x.created_at).getMonth();

        //     reviewByMonth[month] += 1;


        //   })




          const ctx = this.reviewsChart.nativeElement.getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [{
                label: 'Monthly Reviews Trends',
                // data : reviewByMonth,
                data: [65, 59, 80, 81, 56, 55, 40, 65, 75, 85, 90, 95],
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Monthly Sales Trend'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }

         createSalesChart() {
      if (!this.reviewsChart) return;

      const ctx = this.reviewsChart.nativeElement.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Monthly Sales',
            data: [65, 59, 80, 81, 56, 55, 40, 65, 75, 85, 90, 95],
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Sales Trend'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }




}
