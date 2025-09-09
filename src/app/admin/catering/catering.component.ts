import { Component } from '@angular/core';
import { CateringPackage, CateringOrder } from 'src/app/Models/catering-package.model';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-catering',
  templateUrl: './catering.component.html',
  styleUrls: ['./catering.component.scss']
})
export class CateringComponent {

  packages: CateringPackage[] = [];
  cateringOrders: CateringOrder[] = [];
  showCreateModal = false;
  showEditModal = false;

  currentPackage: any = {
    provider_id: 1,
    name: '',
    description: '',
    base_price: 0,
    max_people: 0,
    image_url: '',
    status: 'active'
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPackages();
    this.loadCateringOrders();
  }

  loadPackages() {
    this.apiService.getCateringPackages().subscribe(packages => {
      this.packages = packages;
    });
  }

  loadCateringOrders() {
    this.apiService.getCateringOrders().subscribe(orders => {
      this.cateringOrders = orders;
    });
  }

  editPackage(pkg: CateringPackage) {
    this.currentPackage = { ...pkg };
    this.showEditModal = true;
  }

  deletePackage(id: number) {
    if (confirm('Are you sure you want to delete this catering package?')) {
      this.apiService.deleteCateringPackage(id).subscribe(() => {
        this.loadPackages();
      });
    }
  }

  togglePackageStatus(pkg: CateringPackage) {
    const newStatus = pkg.status === 'active' ? 'inactive' : 'active';
    this.apiService.updateCateringPackage(pkg.id, { status: newStatus }).subscribe(() => {
      this.loadPackages();
    });
  }

  savePackage() {
    if (this.showEditModal) {
      this.apiService.updateCateringPackage(this.currentPackage.id, this.currentPackage).subscribe(() => {
        this.loadPackages();
        this.closeModal();
      });
    } else {
      this.apiService.createCateringPackage(this.currentPackage).subscribe(() => {
        this.loadPackages();
        this.closeModal();
      });
    }
  }

  getPackageName(packageId: number): string {
    const pkg = this.packages.find(p => p.id === packageId);
    return pkg ? pkg.name : 'Unknown Package';
  }

  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.currentPackage = {
      provider_id: 1,
      name: '',
      description: '',
      base_price: 0,
      max_people: 0,
      image_url: '',
      status: 'active'
    };
  }

}
