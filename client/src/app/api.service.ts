import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AnalyticsSummary, Business, Category, Coupon, Payment, RegistrationRequest, Subscription, Review } from './models';

const API_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000/api'
    : '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private authOptions() {
    const token = localStorage.getItem('authToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  login(email: string, password: string, role?: 'admin' | 'client'): Observable<{ token: string; user: { id: number; email: string; name: string; role: 'admin' | 'client'; businessId: number | null } }> {
    return this.http.post<{ token: string; user: { id: number; email: string; name: string; role: 'admin' | 'client'; businessId: number | null } }>(`${API_URL}/auth/login`, { email, password, role });
  }

  saveSession(token: string, user: unknown): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }

  getSessionUser(): { id: number; email: string; name: string; role: 'admin' | 'client'; businessId: number | null } | null {
    const value = localStorage.getItem('authUser');
    return value ? JSON.parse(value) : null;
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_URL}/categories`);
  }

  getBusinesses(filters: { search?: string; category?: string; status?: string; featured?: boolean } = {}): Observable<Business[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<Business[]>(`${API_URL}/businesses`, { params });
  }

  getBusiness(slug: string): Observable<Business> {
    return this.http.get<Business>(`${API_URL}/businesses/${slug}`);
  }

  createBusiness(payload: Partial<Business>): Observable<Business> {
    return this.http.post<Business>(`${API_URL}/businesses`, payload, this.authOptions());
  }

  updateBusiness(id: number, payload: Partial<Business>): Observable<Business> {
    return this.http.put<Business>(`${API_URL}/businesses/${id}`, payload, this.authOptions());
  }

  deleteBusiness(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/businesses/${id}`, this.authOptions());
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${API_URL}/coupons`);
  }

  createCoupon(payload: Partial<Coupon> & { expiresAt?: string | null }): Observable<Coupon> {
    return this.http.post<Coupon>(`${API_URL}/coupons`, payload, this.authOptions());
  }

  getRequests(): Observable<RegistrationRequest[]> {
    return this.http.get<RegistrationRequest[]>(`${API_URL}/requests`, this.authOptions());
  }

  createRequest(payload: Partial<RegistrationRequest>): Observable<RegistrationRequest> {
    return this.http.post<RegistrationRequest>(`${API_URL}/requests`, payload);
  }

  updateRequestStatus(id: number, status: RegistrationRequest['status']): Observable<RegistrationRequest> {
    return this.http.patch<RegistrationRequest>(`${API_URL}/requests/${id}/status`, { status }, this.authOptions());
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${API_URL}/subscriptions`, this.authOptions());
  }

  updateSubscription(id: number, payload: Partial<Subscription>): Observable<Subscription> {
    return this.http.put<Subscription>(`${API_URL}/subscriptions/${id}`, payload, this.authOptions());
  }

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${API_URL}/subscriptions/payments`, this.authOptions());
  }

  createPayment(subscriptionId: number, payload: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(`${API_URL}/subscriptions/${subscriptionId}/payments`, payload, this.authOptions());
  }

  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${API_URL}/analytics/summary`, this.authOptions());
  }

  trackPageView(path: string, businessId?: number | null): Observable<void> {
    return this.http.post<void>(`${API_URL}/analytics/page-view`, {
      path,
      businessId: businessId || null,
      referrer: document.referrer || '',
    });
  }

  getClientBusinesses(): Observable<{ email: string; businesses: Business[] }> {
    return this.http.get<{ email: string; businesses: Business[] }>(`${API_URL}/client/me/businesses`, this.authOptions());
  }

  updateClientBusiness(id: number, payload: Partial<Business>): Observable<Business> {
    return this.http.put<Business>(`${API_URL}/client/businesses/${id}`, payload, this.authOptions());
  }

  addReview(slug: string, review: { authorName: string; rating: number; comment: string }): Observable<Review> {
    return this.http.post<Review>(`${API_URL}/businesses/${slug}/reviews`, review);
  }
}
