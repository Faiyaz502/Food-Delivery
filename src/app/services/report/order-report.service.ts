import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { OrderReportDto } from 'src/app/Models/Reports/orderReport.model';

@Injectable({
  providedIn: 'root'
})
export class OrderReportService {

  // Update this URL to match your backend
  private apiUrl = `${environment.apiUrl}/api/reports`;
  // Alternative: private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  /**
   * Download single order report
   */
  downloadSingleOrderReport(
    order: OrderReportDto,
    format: 'pdf' | 'html' | 'xlsx' = 'pdf',
    template: 'a4' | 'thermal' = 'a4'
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('format', format)
      .set('template', template);

    return this.http.post(
      `${this.apiUrl}/order/single`,
      order,
      {
        params,
        responseType: 'blob'
      }
    );
  }

  /**
   * Download multiple orders report
   */
  downloadMultipleOrdersReport(
    orders: OrderReportDto[],
    format: 'pdf' | 'html' | 'xlsx' = 'pdf',
    template: 'a4' | 'thermal' = 'a4'
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('format', format)
      .set('template', template);

    return this.http.post(
      `${this.apiUrl}/order/multiple`,
      orders,
      {
        params,
        responseType: 'blob'
      }
    );
  }

  /**
   * Preview order report (opens in new tab)
   */
  previewOrderReport(
    order: OrderReportDto,
    format: 'pdf' | 'html' = 'pdf',
    template: 'a4' | 'thermal' = 'a4'
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('format', format)
      .set('template', template);

    return this.http.post(
      `${this.apiUrl}/order/preview`,
      order,
      {
        params,
        responseType: 'blob'
      }
    );
  }

  /**
   * Helper method to trigger download
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Helper method to open preview in new tab
   */
  openPreview(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Note: URL will be released when the tab is closed
  }

  /**
   * Print thermal receipt directly
   */
  printThermalReceipt(order: OrderReportDto): void {
    this.downloadSingleOrderReport(order, 'pdf', 'thermal')
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');

        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      });
  }

  /**
   * Get filename based on order and format
   */
  getFilename(orderNumber: string, format: string, isMultiple: boolean = false): string {
    if (isMultiple) {
      return `orders_report.${format}`;
    }
    return `order_${orderNumber}.${format}`;
  }
}

