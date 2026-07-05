import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { Business, Category, Coupon } from './models';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './directory.component.html',
})
export class DirectoryComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  businesses: Business[] = [];
  coupons: Coupon[] = [];
  search = '';
  selectedCategory = '';
  loading = true;

  ngOnInit(): void {
    this.api.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.detectChanges();
    });
    this.api.getCoupons().subscribe((coupons) => {
      this.coupons = coupons.filter((coupon) => coupon.active);
      this.cdr.detectChanges();
    });
    this.route.queryParamMap.subscribe((params) => {
      this.search = params.get('search') || '';
      this.selectedCategory = params.get('category') || '';
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.api.getBusinesses({ search: this.search, category: this.selectedCategory, status: 'active' }).subscribe({
      next: (businesses) => {
        this.businesses = businesses;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.router.navigate(['/directorio'], {
      queryParams: {
        search: this.search || null,
        category: this.selectedCategory || null,
      },
    });
  }

  selectCategory(slug: string): void {
    this.selectedCategory = this.selectedCategory === slug ? '' : slug;
    this.applyFilters();
  }
}
