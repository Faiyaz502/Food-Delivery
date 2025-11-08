import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { environment } from 'src/app/Envirment/environment';
import { OrderResponseDTO } from 'src/app/Models/Order/order.models';
import { OrderReportDto } from 'src/app/Models/Reports/orderReport.model';
import { OrderService } from 'src/app/services/Orders/order.service';
import { OrderReportService } from 'src/app/services/report/order-report.service';


@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent {

  @Input() isOpen: boolean = false;
  @Input() restaurantId!: number;
  @ViewChild('downloadDropdown') downloadDropdown!: ElementRef;

  // Order properties
  orders: OrderResponseDTO[] = [];
  selectedOrder: OrderResponseDTO | null = null;
  showOrderModal: Boolean = false;

  // Report properties
  selectedOrders: OrderResponseDTO[] = [];
  loading: boolean = false;
  activeDownloadMenu: number | null = null;

  // Pagination properties
  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  constructor(
    private orderService: OrderService,
    private reportService: OrderReportService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['restaurantId'] && this.restaurantId) {
      this.loadOrders(); // reload orders whenever restaurant changes
    }
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  loadOrders(page: number = 0) {
    this.orderService.getOrdersByRestaurant(this.restaurantId, page, this.pageSize).subscribe({
      next: (response: any) => {
        this.orders = response.content || response;
        this.totalPages = response.totalPages || 1;
        this.totalElements = response.totalElements || this.orders.length;
        this.currentPage = response.number || page;
        console.log(response);
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.loadOrders(page);
    }
  }

  closeDetails() {
    this.selectedOrder = null;
  }

  close() {
    this.isOpen = false;
  }

  viewOrderDetails(order: any) {
    console.log('View clicked for order:', order);
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return `৳${amount?.toFixed(2) || '0.00'}`;
  }

  formatStatusText(status: string): string {
    return status.replace(/_/g, ' ').toUpperCase();
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // ==================== JasperReports Integration ====================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.downloadDropdown && !this.downloadDropdown.nativeElement.contains(event.target)) {
      this.activeDownloadMenu = null;
    }
  }

  // ==================== Selection Methods ====================

  toggleOrderSelection(order: any): void {
    const index = this.selectedOrders.findIndex(o => o.id === order.id);
    if (index > -1) {
      this.selectedOrders.splice(index, 1);
    } else {
      this.selectedOrders.push(order);
    }
  }

  isOrderSelected(order: any): boolean {
    return this.selectedOrders.some(o => o.id === order.id);
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.selectedOrders = [...this.orders];
    } else {
      this.selectedOrders = [];
    }
  }

  allOrdersSelected(): boolean {
    return this.orders.length > 0 && this.selectedOrders.length === this.orders.length;
  }

  clearSelection(): void {
    this.selectedOrders = [];
  }

  // ==================== Download Menu Methods ====================

  toggleDownloadMenu(orderId: number): void {
    this.activeDownloadMenu = this.activeDownloadMenu === orderId ? null : orderId;
  }

  // ==================== Single Order Report Methods ====================

  downloadOrderPdf(order: any): void {
    this.loading = true;
    this.activeDownloadMenu = null;

    const reportDto = this.convertToReportDto(order);

    this.reportService.downloadSingleOrderReport(reportDto, 'pdf', 'a4')
      .subscribe({
        next: (blob) => {
          const filename = `order_${order.orderNumber}.pdf`;
          this.reportService.triggerDownload(blob, filename);
          this.loading = false;
          this.showSuccessMessage('PDF downloaded successfully');
        },
        error: (err) => {
          console.error('Error downloading PDF:', err);
          this.loading = false;
          this.showErrorMessage('Failed to download PDF');
        }
      });
  }

  downloadOrderHtml(order: any): void {
    this.loading = true;
    this.activeDownloadMenu = null;

    const reportDto = this.convertToReportDto(order);

    this.reportService.downloadSingleOrderReport(reportDto, 'html', 'a4')
      .subscribe({
        next: (blob) => {
          const filename = `order_${order.orderNumber}.html`;
          this.reportService.triggerDownload(blob, filename);
          this.loading = false;
          this.showSuccessMessage('HTML downloaded successfully');
        },
        error: (err) => {
          console.error('Error downloading HTML:', err);
          this.loading = false;
          this.showErrorMessage('Failed to download HTML');
        }
      });
  }

  downloadOrderExcel(order: any): void {
    this.loading = true;
    this.activeDownloadMenu = null;

    const reportDto = this.convertToReportDto(order);

    this.reportService.downloadSingleOrderReport(reportDto, 'xlsx', 'a4')
      .subscribe({
        next: (blob) => {
          const filename = `order_${order.orderNumber}.xlsx`;
          this.reportService.triggerDownload(blob, filename);
          this.loading = false;
          this.showSuccessMessage('Excel downloaded successfully');
        },
        error: (err) => {
          console.error('Error downloading Excel:', err);
          this.loading = false;
          this.showErrorMessage('Failed to download Excel');
        }
      });
  }

  downloadThermalReceipt(order: any): void {
    this.loading = true;
    this.activeDownloadMenu = null;

    const reportDto = this.convertToReportDto(order);

    this.reportService.downloadSingleOrderReport(reportDto, 'pdf', 'thermal')
      .subscribe({
        next: (blob) => {
          const filename = `thermal_receipt_${order.orderNumber}.pdf`;
          this.reportService.triggerDownload(blob, filename);
          this.loading = false;
          this.showSuccessMessage('Thermal receipt downloaded successfully');
        },
        error: (err) => {
          console.error('Error downloading thermal receipt:', err);
          this.loading = false;
          this.showErrorMessage('Failed to download thermal receipt');
        }
      });
  }

  printThermalReceipt(order: any): void {
    this.loading = true;
    this.activeDownloadMenu = null;

    const reportDto = this.convertToReportDto(order);

    this.reportService.downloadSingleOrderReport(reportDto, 'pdf', 'thermal')
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const printWindow = window.open(url, '_blank');

          if (printWindow) {
            printWindow.onload = () => {
              printWindow.print();
            };
          }
          this.loading = false;
          this.showSuccessMessage('Print dialog opened');
        },
        error: (err) => {
          console.error('Error printing thermal receipt:', err);
          this.loading = false;
          this.showErrorMessage('Failed to print thermal receipt');
        }
      });
  }

  previewOrder(order: any): void {
    this.loading = true;
    this.activeDownloadMenu = null;

    const reportDto = this.convertToReportDto(order);

    this.reportService.previewOrderReport(reportDto, 'pdf', 'a4')
      .subscribe({
        next: (blob) => {
          this.reportService.openPreview(blob);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error previewing order:', err);
          this.loading = false;
          this.showErrorMessage('Failed to preview order');
        }
      });
  }

  // ==================== Multiple Orders Report Methods ====================

  downloadMultipleOrdersPdf(): void {
    if (this.selectedOrders.length === 0) {
      this.showErrorMessage('Please select at least one order');
      return;
    }

    this.loading = true;
    const reportDtos = this.selectedOrders.map(order => this.convertToReportDto(order));

    this.reportService.downloadMultipleOrdersReport(reportDtos, 'pdf', 'a4')
      .subscribe({
        next: (blob) => {
          const filename = `orders_report_${this.selectedOrders.length}_orders.pdf`;
          this.reportService.triggerDownload(blob, filename);
          this.loading = false;
          this.showSuccessMessage(`${this.selectedOrders.length} orders downloaded as PDF`);
          this.clearSelection();
        },
        error: (err) => {
          console.error('Error downloading multiple orders PDF:', err);
          this.loading = false;
          this.showErrorMessage('Failed to download orders PDF');
        }
      });
  }

  downloadMultipleOrdersExcel(): void {
    if (this.selectedOrders.length === 0) {
      this.showErrorMessage('Please select at least one order');
      return;
    }

    this.loading = true;
    const reportDtos = this.selectedOrders.map(order => this.convertToReportDto(order));

    this.reportService.downloadMultipleOrdersReport(reportDtos, 'xlsx', 'a4')
      .subscribe({
        next: (blob) => {
          const filename = `orders_report_${this.selectedOrders.length}_orders.xlsx`;
          this.reportService.triggerDownload(blob, filename);
          this.loading = false;
          this.showSuccessMessage(`${this.selectedOrders.length} orders downloaded as Excel`);
          this.clearSelection();
        },
        error: (err) => {
          console.error('Error downloading multiple orders Excel:', err);
          this.loading = false;
          this.showErrorMessage('Failed to download orders Excel');
        }
      });
  }

  printMultipleThermalReceipts(): void {
    if (this.selectedOrders.length === 0) {
      this.showErrorMessage('Please select at least one order');
      return;
    }

    this.loading = true;
    const reportDtos = this.selectedOrders.map(order => this.convertToReportDto(order));

    this.reportService.downloadMultipleOrdersReport(reportDtos, 'pdf', 'thermal')
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const printWindow = window.open(url, '_blank');

          if (printWindow) {
            printWindow.onload = () => {
              printWindow.print();
            };
          }
          this.loading = false;
          this.showSuccessMessage(`Print dialog opened for ${this.selectedOrders.length} orders`);
          this.clearSelection();
        },
        error: (err) => {
          console.error('Error printing multiple thermal receipts:', err);
          this.loading = false;
          this.showErrorMessage('Failed to print thermal receipts');
        }
      });
  }

  // ==================== Order Conversion Method ====================

  private convertToReportDto(order: any): OrderReportDto {
    return {
      customerName: order.customerName || 'N/A',
      restaurantName: order.restaurantName || 'N/A',
      orderNumber: order.orderNumber || '',
      orderDate: order.orderDate,
      deliveryAddress: order.deliveryAddress || 'N/A',
      paymentMethod: order.paymentMethod || 'N/A',
      paymentStatus: order.paymentStatus || 'N/A',
      deliveryType: order.deliveryType || 'N/A',
      estimatedDeliveryTime: order.estimatedDeliveryTime || order.orderDate,
      specialInstructions: order.specialInstructions || '',
      subtotal: order.subtotal || order.totalAmount || 0,
      deliveryFee: order.deliveryFee || 0,
      taxAmount: order.taxAmount || 0,
      discount: order.discount || 0,
      totalAmount: order.totalAmount || 0,
      items: (order.orderItems || []).map((item: any) => ({
        itemName: item.menuItemName || item.itemName || 'Unknown Item',
        quantity: item.quantity || 0,
        unitPrice: item.price || item.unitPrice || 0,
        totalPrice: item.totalPrice || (item.quantity * item.price) || 0
      }))
    };
  }

  // ==================== Toast/Alert Methods ====================

  private showSuccessMessage(message: string): void {
    // TODO: Implement your toast/notification service
    console.log('✅ Success:', message);

    // Simple alert for now (replace with your notification service)
    this.showToast(message, 'success');
  }

  private showErrorMessage(message: string): void {
    // TODO: Implement your toast/notification service
    console.error('❌ Error:', message);

    // Simple alert for now (replace with your notification service)
    this.showToast(message, 'error');
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Temporary implementation - replace with your toast service
    // For example: this.toastService.show(message, type);

    // Simple browser alert fallback
    alert(`${type.toUpperCase()}: ${message}`);

    // Or you can create a simple toast UI:
    /*
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    */
  }
}
