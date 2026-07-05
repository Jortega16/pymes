export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  businessCount?: number;
}

export interface Business {
  id: number;
  name: string;
  slug: string;
  ownerEmail: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryColor: string;
  description: string;
  province: string;
  canton: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  imageUrl: string;
  galleryUrls: string[];
  story: string;
  services: string[];
  schedule: string;
  coverageArea: string;
  socialLinks: Record<string, string>;
  verificationNotes: string;
  status: 'active' | 'pending' | 'paused';
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  plan: 'starter' | 'growth' | 'premium';
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
  reviews?: Review[];
}

export interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Subscription {
  id: number;
  businessId: number;
  businessName: string;
  plan: 'starter' | 'growth' | 'premium';
  status: 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled';
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  amountCents: number;
  currency: string;
  nextPaymentAt: string | null;
  lastPaymentAt: string | null;
  paymentMethod: string;
}

export interface Payment {
  id: number;
  businessId: number;
  businessName: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  dueAt: string | null;
  paidAt: string | null;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  views7d: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  topBusinesses: { id: number; name: string; views: number }[];
  views7dHistory?: { date: string; views: number }[];
  planDistribution?: { plan: string; count: number }[];
}

export interface Coupon {
  id: number;
  businessId: number;
  businessName: string;
  title: string;
  code: string;
  discount: string;
  expiresAt: string | null;
  active: boolean;
}

export interface RegistrationRequest {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  categoryId: number | null;
  categoryName: string | null;
  message: string;
  formPayload?: Record<string, unknown>;
  declarations?: Record<string, boolean>;
  status: 'new' | 'contacted' | 'approved' | 'rejected';
  createdAt: string;
}
