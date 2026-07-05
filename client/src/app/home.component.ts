import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { Business, Category } from './models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  categories: Category[] = [];
  businesses: Business[] = [];
  search = '';
  selectedCategory = '';
  homeCategories = [
    { label: 'Hogar y jardin', icon: 'home' },
    { label: 'Construccion y mejoras', icon: 'tools' },
    { label: 'Belleza y salud', icon: 'beauty' },
    { label: 'Tecnologia y electronica', icon: 'tech' },
    { label: 'Eventos y fiestas', icon: 'events' },
    { label: 'Alimentos y bebidas', icon: 'food' },
    { label: 'Mascotas', icon: 'pets' },
    { label: 'Servicios profesionales', icon: 'briefcase' },
  ];

  ngOnInit(): void {
    this.api.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.detectChanges();
    });
    this.api.getBusinesses({ status: 'active' }).subscribe((businesses) => {
      this.businesses = businesses;
      this.cdr.detectChanges();
    });
  }

  searchDirectory(): void {
    this.router.navigate(['/directorio'], {
      queryParams: {
        search: this.search || null,
        category: this.selectedCategory || null,
      },
    });
  }

  get verifiedCount(): number {
    return Math.max(this.businesses.length, 6);
  }
}
