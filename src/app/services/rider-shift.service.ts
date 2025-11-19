import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RiderShiftDetail, PayrollRuleDTO, UpdatePayrollRuleRequest } from '../Models/payroll/riderShift.model';
import { environment } from '../Envirment/environment';

@Injectable({
  providedIn: 'root'
})
export class RiderShiftService {

 private readonly API_URL = `${environment.apiUrl}/api/shifts`;
  private readonly RULES_URL = `${environment.apiUrl}/api/admin/payroll-rules`;

  constructor(private http: HttpClient) { }

  //  ADMIN: Get paginated shifts
  getAllShiftsForAdmin(
    page: number = 0,
    size: number = 20,
    startDate?: string,
    endDate?: string,
    riderId?: number,
    riderName?: string
  ): Observable<any> { // Returns Spring Page structure
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (riderId) params = params.set('riderId', riderId.toString());
    if (riderName) params = params.set('riderName', riderName);

    return this.http.get<any>(`${this.API_URL}/admin`, { params });
  }

  //  RIDER: Get own shifts
  getMyShifts(
    page: number = 0,
    size: number = 20,
    startDate?: string,
    endDate?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.API_URL}/me`, { params });
  }

  //  Get shift detail (Admin or Rider)
  getShiftDetail(shiftId: number): Observable<RiderShiftDetail> {
    return this.http.get<RiderShiftDetail>(`${this.API_URL}/admin/${shiftId}`);
  }

  //  Get own shift detail
  getMyShiftDetail(shiftId: number): Observable<RiderShiftDetail> {
    return this.http.get<RiderShiftDetail>(`${this.API_URL}/me/${shiftId}`);
  }

  //  End a shift manually (Admin only)
  endShiftManually(shiftId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${shiftId}/end`, {});
  }

  //  PAYROLL RULES MANAGEMENT

  //  Get all payroll rules
  getAllPayrollRules(): Observable<PayrollRuleDTO[]> {
    return this.http.get<PayrollRuleDTO[]>(this.RULES_URL);
  }

  //  Get single rule
  getPayrollRule(key: string): Observable<PayrollRuleDTO> {
    return this.http.get<PayrollRuleDTO>(`${this.RULES_URL}/${key}`);
  }

  //  Update a rule
  updatePayrollRule(
    key: string,
    request: UpdatePayrollRuleRequest
  ): Observable<PayrollRuleDTO> {
    return this.http.put<PayrollRuleDTO>(`${this.RULES_URL}/${key}`, request);
  }

  // 💡 Helper: Convert LocalDate string to YYYY-MM-DD
  formatDate(date: Date | string | null): string | undefined {
    if (!date) return undefined;

    if (typeof date === 'string') {
      // Already a string? Try to parse
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
      return date; // Assume it's already formatted
    }

    // Date object
    return date.toISOString().split('T')[0];
  }
}
