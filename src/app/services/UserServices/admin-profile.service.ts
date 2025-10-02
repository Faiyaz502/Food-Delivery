import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminLevel } from 'src/app/Enums/profileEnums';
import { environment } from 'src/app/Envirment/environment';
import { AdminProfileCreateDTO, AdminProfile, AdminPermissionsDTO } from 'src/app/Models/Users/profile.model';
import { PaginatedResponse } from 'src/app/Models/Users/user.models';

@Injectable({
  providedIn: 'root'
})
export class AdminProfileService {

  private apiUrl = `${environment.apiUrl}/api/admin-profiles`;

  constructor(private http: HttpClient) {}

  createAdminProfile(userId: number, profile: AdminProfileCreateDTO): Observable<AdminProfile> {
    return this.http.post<AdminProfile>(`${this.apiUrl}/user/${userId}`, profile);
  }

  getAdminProfileById(id: number): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.apiUrl}/${id}`);
  }

  getAdminProfileByUserId(userId: number): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.apiUrl}/user/${userId}`);
  }

  getAllAdminProfiles(page = 0, size = 10, sortBy = 'accessLevel', sortDir = 'DESC'): Observable<PaginatedResponse<AdminProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<PaginatedResponse<AdminProfile>>(this.apiUrl, { params });
  }

  getAdminsByDepartment(department: string, page = 0, size = 10): Observable<PaginatedResponse<AdminProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<AdminProfile>>(`${this.apiUrl}/department/${department}`, { params });
  }

  getAdminsByLevel(level: AdminLevel, page = 0, size = 10): Observable<PaginatedResponse<AdminProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<AdminProfile>>(`${this.apiUrl}/level/${level}`, { params });
  }

  getAdminsBySupervisor(supervisorId: number): Observable<AdminProfile[]> {
    return this.http.get<AdminProfile[]>(`${this.apiUrl}/supervisor/${supervisorId}`);
  }

  getAdminsWithHighAccess(): Observable<AdminProfile[]> {
    return this.http.get<AdminProfile[]>(`${this.apiUrl}/high-access`);
  }

  getAdminsWithPermission(permission: string): Observable<AdminProfile[]> {
    return this.http.get<AdminProfile[]>(`${this.apiUrl}/permission/${permission}`);
  }

  updateAdminProfile(id: number, profile: AdminProfileCreateDTO): Observable<AdminProfile> {
    return this.http.put<AdminProfile>(`${this.apiUrl}/${id}`, profile);
  }

  updatePermissions(id: number, permissions: AdminPermissionsDTO): Observable<AdminProfile> {
    return this.http.patch<AdminProfile>(`${this.apiUrl}/${id}/permissions`, permissions);
  }

  recordLogin(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/login`, null);
  }

  checkPermission(id: number, action: string): Observable<boolean> {
    const params = new HttpParams().set('action', action);
    return this.http.get<boolean>(`${this.apiUrl}/${id}/check-permission`, { params });
  }

  getAdminStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }

  deleteAdminProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
