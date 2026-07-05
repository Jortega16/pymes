import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { Business } from './models';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './business-detail.component.html',
})
export class BusinessDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  business: Business | null = null;
  loading = true;

  // Review form state
  authorName = '';
  rating = 5;
  comment = '';
  reviewError = '';
  reviewSuccess = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getBusiness(slug).subscribe({
      next: (business) => {
        this.business = business;
        this.loading = false;
        this.api.trackPageView(`/negocio/${business.slug}`, business.id).subscribe({ error: () => undefined });
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get gallery(): string[] {
    if (!this.business) return [];
    return [this.business.imageUrl, ...(this.business.galleryUrls || [])].filter(Boolean).slice(0, 4);
  }

  get whatsappUrl(): string {
    if (!this.business) return '';
    return this.business.socialLinks?.['whatsapp'] || `https://wa.me/${this.business.phone.replace(/\D/g, '')}`;
  }

  setRating(val: number): void {
    this.rating = val;
  }

  submitReview(): void {
    if (!this.business || !this.authorName || !this.comment) return;
    this.reviewError = '';
    this.reviewSuccess = '';

    this.api.addReview(this.business.slug, {
      authorName: this.authorName,
      rating: this.rating,
      comment: this.comment
    }).subscribe({
      next: (review) => {
        // Prepend new review
        this.business!.reviews = [review, ...(this.business!.reviews || [])];
        
        // Recalculate average rating and count locally
        const reviews = this.business!.reviews;
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        this.business!.rating = totalRating / reviews.length;
        this.business!.reviewCount = reviews.length;
        
        // Reset form
        this.authorName = '';
        this.rating = 5;
        this.comment = '';
        this.reviewSuccess = '¡Gracias! Tu reseña ha sido publicada.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.reviewError = 'Error al enviar la reseña. Inténtalo de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }
}
