import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { Business, Category } from './models';

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-portal.component.html',
})
export class ClientPortalComponent implements OnInit {
  readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  email = this.api.getSessionUser()?.role === 'client' ? this.api.getSessionUser()?.email || '' : '';
  password = '';
  loginError = '';
  categories: Category[] = [];
  businesses: Business[] = [];
  selected: Business | null = null;
  servicesText = '';
  galleryText = '';
  socialInstagram = '';
  socialFacebook = '';
  socialWhatsapp = '';
  notice = '';
  activeSection: 'profile' | 'details' | 'media' | 'contact' = 'profile';

  ngOnInit(): void {
    this.api.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.detectChanges();
    });
    if (this.isAuthenticated) this.loadBusinesses();
  }

  get isAuthenticated(): boolean {
    return this.api.getSessionUser()?.role === 'client' || this.api.getSessionUser()?.role === 'admin';
  }

  login(): void {
    if (!this.email) return;
    this.loginError = '';
    this.api.login(this.email, this.password, 'client').subscribe({
      next: (session) => {
        this.api.saveSession(session.token, session.user);
        this.password = '';
        this.loadBusinesses();
      },
      error: () => {
        this.loginError = 'Correo o contraseña inválidos.';
        this.cdr.detectChanges();
      },
    });
  }

  loadBusinesses(): void {
    this.api.getClientBusinesses().subscribe((session) => {
      this.businesses = session.businesses;
      this.selected = session.businesses[0] ? { ...session.businesses[0] } : null;
      this.notice = session.businesses.length ? '' : 'No encontramos pymes asociadas a este correo.';
      if (this.selected) this.edit(this.selected);
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.api.logout();
    this.businesses = [];
    this.selected = null;
    this.cdr.detectChanges();
  }

  edit(business: Business): void {
    this.selected = { ...business };
    this.servicesText = (business.services || []).join('\n');
    this.galleryText = (business.galleryUrls || []).join('\n');
    this.socialInstagram = business.socialLinks?.['instagram'] || '';
    this.socialFacebook = business.socialLinks?.['facebook'] || '';
    this.socialWhatsapp = business.socialLinks?.['whatsapp'] || '';
  }

  save(): void {
    if (!this.selected) return;
    const payload = {
      ...this.selected,
      services: this.servicesText.split('\n').map((item) => item.trim()).filter(Boolean),
      galleryUrls: this.galleryText.split('\n').map((item) => item.trim()).filter(Boolean),
      socialLinks: {
        instagram: this.socialInstagram,
        facebook: this.socialFacebook,
        whatsapp: this.socialWhatsapp,
      },
    };
    this.api.updateClientBusiness(this.selected.id, payload).subscribe(() => {
      this.notice = 'Cambios enviados. La ficha queda pendiente de revisión.';
      this.loadBusinesses();
    });
  }

  get selectedStatusLabel(): string {
    if (!this.selected) return 'Sin pyme';
    return this.selected.status === 'active' ? 'Activa' : this.selected.status === 'pending' ? 'Pendiente' : 'Pausada';
  }
}
