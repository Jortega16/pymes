import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { AnalyticsSummary, Business, Category, Coupon, Payment, RegistrationRequest, Subscription } from './models';

type BusinessForm = Omit<Partial<Business>, 'categoryId'> & { categoryId: number | null };

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './backoffice.component.html',
})
export class BackofficeComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  businesses: Business[] = [];
  requests: RegistrationRequest[] = [];
  coupons: Coupon[] = [];
  subscriptions: Subscription[] = [];
  payments: Payment[] = [];
  analytics: AnalyticsSummary | null = null;
  editingId: number | null = null;
  activeTab: 'overview' | 'businesses' | 'requests' | 'subscriptions' | 'payments' | 'analytics' | 'coupons' = 'overview';
  notice = '';
  loginEmail = 'admin@pymesverificadas.cr';
  loginPassword = '';
  loginError = '';

  get maxViews(): number {
    const history = this.analytics?.views7dHistory || [];
    if (!history.length) return 10;
    const max = Math.max(...history.map(h => h.views));
    return max > 0 ? max : 10;
  }

  get svgPath(): string {
    const history = this.analytics?.views7dHistory || [];
    if (history.length < 2) return '';
    const max = this.maxViews;
    const width = 500;
    const height = 150;
    const step = width / (history.length - 1);
    
    return history.map((h, i) => {
      const x = i * step;
      const y = height - (h.views / max) * (height - 40) - 20;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  get svgAreaPath(): string {
    const history = this.analytics?.views7dHistory || [];
    if (history.length < 2) return '';
    const max = this.maxViews;
    const width = 500;
    const height = 150;
    const step = width / (history.length - 1);
    
    const points = history.map((h, i) => {
      const x = i * step;
      const y = height - (h.views / max) * (height - 40) - 20;
      return `${x},${y}`;
    });
    
    return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  }

  get svgPoints(): { x: number; y: number; date: string; views: number }[] {
    const history = this.analytics?.views7dHistory || [];
    if (!history.length) return [];
    const max = this.maxViews;
    const width = 500;
    const height = 150;
    const step = history.length > 1 ? width / (history.length - 1) : width;
    
    return history.map((h, i) => ({
      x: i * step,
      y: height - (h.views / max) * (height - 40) - 20,
      date: h.date,
      views: h.views
    }));
  }

  get planStarterCount(): number {
    return this.analytics?.planDistribution?.find(p => p.plan === 'starter')?.count || 0;
  }

  get planGrowthCount(): number {
    return this.analytics?.planDistribution?.find(p => p.plan === 'growth')?.count || 0;
  }

  get planPremiumCount(): number {
    return this.analytics?.planDistribution?.find(p => p.plan === 'premium')?.count || 0;
  }

  get totalPlanCount(): number {
    const starter = this.planStarterCount;
    const growth = this.planGrowthCount;
    const premium = this.planPremiumCount;
    const total = starter + growth + premium;
    return total > 0 ? total : 1;
  }

  business: BusinessForm = this.emptyBusiness();
  coupon = {
    businessId: null as number | null,
    title: '',
    code: '',
    discount: '',
    expiresAt: '',
    active: true,
  };
  payment = {
    subscriptionId: null as number | null,
    amountCents: 0,
    status: 'paid' as Payment['status'],
    paidAt: new Date().toISOString().slice(0, 10),
    reference: '',
    notes: '',
  };
  servicesText = '';
  galleryText = '';

  ngOnInit(): void {
    if (this.isAuthenticated) this.refresh();
  }

  get isAuthenticated(): boolean {
    return this.api.getSessionUser()?.role === 'admin';
  }

  login(): void {
    this.loginError = '';
    this.api.login(this.loginEmail, this.loginPassword, 'admin').subscribe({
      next: (session) => {
        this.api.saveSession(session.token, session.user);
        this.loginPassword = '';
        this.refresh();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loginError = 'Correo o contraseña inválidos.';
        this.cdr.detectChanges();
      },
    });
  }

  logout(): void {
    this.api.logout();
    this.cdr.detectChanges();
  }

  refresh(): void {
    this.api.getCategories().subscribe((categories) => {
      this.categories = categories;
      if (!this.business.categoryId && categories[0]) this.business.categoryId = categories[0].id;
      this.cdr.detectChanges();
    });
    this.api.getBusinesses({ status: 'all' }).subscribe((businesses) => {
      this.businesses = businesses;
      this.cdr.detectChanges();
    });
    this.api.getRequests().subscribe((requests) => {
      this.requests = requests;
      this.cdr.detectChanges();
    });
    this.api.getCoupons().subscribe((coupons) => {
      this.coupons = coupons;
      this.cdr.detectChanges();
    });
    this.api.getSubscriptions().subscribe((subscriptions) => {
      this.subscriptions = subscriptions;
      this.cdr.detectChanges();
    });
    this.api.getPayments().subscribe((payments) => {
      this.payments = payments;
      this.cdr.detectChanges();
    });
    this.api.getAnalyticsSummary().subscribe((analytics) => {
      this.analytics = analytics;
      this.cdr.detectChanges();
    });
  }

  editBusiness(business: Business): void {
    this.editingId = business.id;
    this.business = { ...business };
    this.servicesText = (business.services || []).join('\n');
    this.galleryText = (business.galleryUrls || []).join('\n');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveBusiness(): void {
    if (!this.business.categoryId) return;
    const payload = {
      ...this.business,
      services: this.servicesText.split('\n').map((item) => item.trim()).filter(Boolean),
      galleryUrls: this.galleryText.split('\n').map((item) => item.trim()).filter(Boolean),
    };
    const request = this.editingId
      ? this.api.updateBusiness(this.editingId, payload as Partial<Business>)
      : this.api.createBusiness(payload as Partial<Business>);

    request.subscribe(() => {
      this.notice = this.editingId ? 'Pyme actualizada.' : 'Pyme creada.';
      this.cancelEdit();
      this.refresh();
      this.cdr.detectChanges();
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.business = this.emptyBusiness();
    this.servicesText = '';
    this.galleryText = '';
    if (this.categories[0]) this.business.categoryId = this.categories[0].id;
  }

  deleteBusiness(id: number): void {
    this.api.deleteBusiness(id).subscribe(() => {
      this.notice = 'Pyme eliminada.';
      this.refresh();
      this.cdr.detectChanges();
    });
  }

  updateRequestStatus(request: RegistrationRequest, status: RegistrationRequest['status']): void {
    this.api.updateRequestStatus(request.id, status).subscribe(() => {
      this.refresh();
      this.cdr.detectChanges();
    });
  }

  createCoupon(): void {
    if (!this.coupon.businessId) return;
    this.api.createCoupon({ ...this.coupon, businessId: this.coupon.businessId, expiresAt: this.coupon.expiresAt || null }).subscribe(() => {
      this.notice = 'Cupón creado.';
      this.coupon = { businessId: null, title: '', code: '', discount: '', expiresAt: '', active: true };
      this.refresh();
      this.cdr.detectChanges();
    });
  }

  updateSubscription(subscription: Subscription): void {
    this.api.updateSubscription(subscription.id, subscription).subscribe(() => {
      this.notice = 'Suscripción actualizada.';
      this.refresh();
    });
  }

  registerPayment(): void {
    if (!this.payment.subscriptionId) return;
    this.api.createPayment(this.payment.subscriptionId, this.payment).subscribe(() => {
      this.notice = 'Pago registrado.';
      this.payment = {
        subscriptionId: null,
        amountCents: 0,
        status: 'paid',
        paidAt: new Date().toISOString().slice(0, 10),
        reference: '',
        notes: '',
      };
      this.refresh();
    });
  }

  get activeBusinesses(): number {
    return this.businesses.filter((business) => business.status === 'active').length;
  }

  get pendingRequests(): number {
    return this.requests.filter((request) => request.status === 'new').length;
  }

  get monthlyRevenue(): number {
    return this.subscriptions
      .filter((subscription) => subscription.status === 'active')
      .reduce((total, subscription) => total + subscription.amountCents, 0);
  }

  get pastDueSubscriptions(): number {
    return this.subscriptions.filter((subscription) => subscription.status === 'past_due').length;
  }

  formatMoney(amountCents: number, currency = 'CRC'): string {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amountCents / 100);
  }

  private emptyBusiness(): BusinessForm {
    return {
      name: '',
      ownerEmail: '',
      categoryId: null,
      description: '',
      province: '',
      canton: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      imageUrl: '',
      status: 'pending',
      isOpen: true,
      rating: 0,
      reviewCount: 0,
      plan: 'starter',
      featured: false,
      galleryUrls: [],
      story: '',
      services: [],
      schedule: '',
      coverageArea: '',
      socialLinks: {},
      verificationNotes: '',
    };
  }
}
