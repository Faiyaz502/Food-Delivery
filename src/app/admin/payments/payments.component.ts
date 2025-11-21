import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { Payment, PaymentFilter, PaymentService, PaymentStatistics } from 'src/app/services/payment/payment.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent {
payments: Payment[] = [];
  statistics: PaymentStatistics | null = null;
  paymentTypes: string[] = [];
  paymentStatuses: string[] = [];

  filterForm: FormGroup;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  loading = false;
  showStatistics = false;
  Math = Math;

  constructor(
    private paymentService: PaymentService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      paymentType: [''],
      paymentStatus: [''],
      userId: [''],
      startDate: [''],
      endDate: [''],
      sortBy: ['paymentDate'],
      sortDirection: ['DESC']
    });
  }

  ngOnInit(): void {
    this.loadPaymentTypes();
    this.loadPaymentStatuses();
    this.loadPayments();

    // Auto-search on filter change
    this.filterForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadPayments();
      });
  }

  loadPaymentTypes(): void {
    this.paymentService.getPaymentTypes().subscribe({
      next: (response) => {
        if (response.success) {
          this.paymentTypes = response.data;
        }
      },
      error: (error) => console.error('Error loading payment types:', error)
    });
  }

  loadPaymentStatuses(): void {
    this.paymentService.getPaymentStatuses().subscribe({
      next: (response) => {
        if (response.success) {
          this.paymentStatuses = response.data;
        }
      },
      error: (error) => console.error('Error loading payment statuses:', error)
    });
  }

  loadPayments(): void {
    this.loading = true;

    const filter: PaymentFilter = {
      ...this.filterForm.value,
      page: this.currentPage,
      size: this.pageSize
    };

    // Remove empty values
    Object.keys(filter).forEach(key => {
      if (filter[key as keyof PaymentFilter] === '' || filter[key as keyof PaymentFilter] === null) {
        delete filter[key as keyof PaymentFilter];
      }
    });

    this.paymentService.getAllPayments(filter).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.payments = response.data;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.pageSize = response.pageSize;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading payments:', error);
      }
    });
  }

  loadStatistics(): void {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;

    this.paymentService.getPaymentStatistics(startDate, endDate).subscribe({
      next: (response) => {
        if (response.success) {
          this.statistics = response.data;
          this.showStatistics = true;
        }
      },
      error: (error) => console.error('Error loading statistics:', error)
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      paymentType: '',
      paymentStatus: '',
      userId: '',
      startDate: '',
      endDate: '',
      sortBy: 'paymentDate',
      sortDirection: 'DESC'
    });
    this.currentPage = 0;
    this.loadPayments();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPayments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadPayments();
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'COMPLETED': 'badge-success',
      'PENDING': 'badge-warning',
      'FAILED': 'badge-danger',
      'REFUNDED': 'badge-info',
      'PARTIALLY_REFUNDED': 'badge-secondary'
    };
    return statusMap[status] || 'badge-secondary';
  }

  getPaymentTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'Customer_Payment': 'Customer Payment',
      'Riders_Collection': 'Rider Collection',
      'Rider_Salary': 'Rider Salary',
      'Restaurants_Payment': 'Restaurant Payout'
    };
    return typeMap[type] || type;
  }

  exportToCSV(): void {
    const csvData = this.convertToCSV(this.payments);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments_${new Date().getTime()}.csv`;
    link.click();
  }

  private convertToCSV(data: Payment[]): string {
    const headers = ['ID', 'Transaction ID', 'User', 'Amount', 'Payment Type', 'Status', 'Method', 'Date'];
    const rows = data.map(p => [
      p.id,
      p.transactionId,
      p.userName,
      p.amount,
      this.getPaymentTypeLabel(p.paymentMethod),
      p.paymentStatus,
      p.paymentMethod,
      new Date(p.paymentDate).toLocaleString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }


  //Download slip

  downloadBulkSlip(): void {
  this.loading = true;

  const filter: PaymentFilter = {
    ...this.filterForm.value,
    // No pagination — backend uses size=1000 or full
  };

  // Clean empty values (same as loadPayments)
  Object.keys(filter).forEach(key => {
    const val = filter[key as keyof PaymentFilter];
    if (val === '' || val === null || val === undefined) {
      delete filter[key as keyof PaymentFilter];
    }
  });

  this.paymentService.downloadBulkPaymentSlip(filter).subscribe({
    next: (blob: Blob) => {
      this.loading = false;
      this.triggerDownload(blob, 'payment_slips.pdf');
    },
    error: (err) => {
      this.loading = false;
      console.error('Error downloading bulk slip:', err);
      alert('Failed to generate payment slips. Please try again.');
    }
  });
}

// ✅ Download single slip by payment ID
downloadSingleSlip(paymentId: number): void {
  this.loading = true;
  this.paymentService.downloadSinglePaymentSlip(paymentId).subscribe({
    next: (blob: Blob) => {
      this.loading = false;
      this.triggerDownload(blob, `payout_slip_${paymentId}.pdf`);
    },
    error: (err) => {
      this.loading = false;
      console.error(`Error downloading slip for ID ${paymentId}:`, err);
      alert(`Failed to generate slip for payment #${paymentId}.`);
    }
  });
}

// ✅ Helper: Trigger file download
private triggerDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}




}
