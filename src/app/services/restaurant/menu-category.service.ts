import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';


export interface MenuCategoryDto {
  name: string;
  description?: string;
  imgUrl?: string;
}
@Injectable({
  providedIn: 'root'
})
export class MenuCategoryService {

  private apiUrl = `${environment.apiUrl}/api/menu-category`; // Backend URL

  constructor(private http: HttpClient) {}

  // Get all menu categories
  getAllCategories(): Observable<MenuCategoryDto[]> {
    return this.http.get<MenuCategoryDto[]>(this.apiUrl);
  }

  // Get a category by name
  getCategoryByName(name: string): Observable<MenuCategoryDto> {
    return this.http.get<MenuCategoryDto>(`${this.apiUrl}/${name}`);
  }

  //restaurant menu

    getCategoryByRestaurant(RestaurantId: number): Observable<MenuCategoryDto[]> {
    return this.http.get<MenuCategoryDto[]>(`${this.apiUrl}/Restaurant/${RestaurantId}`);
  }

}
