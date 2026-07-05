import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { Category } from './models';

@Component({
  selector: 'app-register-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-wizard.component.html',
})
export class RegisterWizardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  currentStep = 0;
  requestSent = false;
  steps = [
    'Negocio',
    'Contacto',
    'Presencia',
    'Operación',
    'Confianza',
    'Referencias',
    'Servicio',
    'Declaraciones',
    'Estrategia',
  ];

  request = this.emptyRequest();

  ngOnInit(): void {
    this.api.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.detectChanges();
    });
  }

  next(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep += 1;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previous(): void {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submitRequest(): void {
    const { declarations, ...formPayload } = this.request;
    this.api
      .createRequest({
        businessName: this.request.businessName,
        ownerName: this.request.ownerName,
        email: this.request.email,
        phone: this.request.phone,
        categoryId: this.request.categoryId,
        message: this.request.message,
        formPayload,
        declarations,
      })
      .subscribe(() => {
        this.requestSent = true;
        this.request = this.emptyRequest();
        this.currentStep = 0;
        this.cdr.detectChanges();
      });
  }

  get progress(): number {
    return ((this.currentStep + 1) / this.steps.length) * 100;
  }

  get allDeclarationsAccepted(): boolean {
    return Object.values(this.request.declarations).every(Boolean);
  }

  private emptyRequest() {
    return {
      businessName: '',
      legalName: '',
      legalId: '',
      startYear: '',
      ownerName: '',
      ownerRole: '',
      email: '',
      phone: '',
      secondaryPhone: '',
      categoryId: null as number | null,
      subcategory: '',
      province: '',
      canton: '',
      district: '',
      address: '',
      website: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      linkedin: '',
      googleBusiness: '',
      marketplace: '',
      operatingTime: '',
      approximateClients: '',
      photosUrl: '',
      logoUrl: '',
      workEvidenceUrl: '',
      electronicInvoice: '',
      warranty: '',
      warrantyExplanation: '',
      returnPolicy: '',
      permits: '',
      permitsUrl: '',
      reference1: '',
      reference2: '',
      reference3: '',
      responseTime: '',
      serviceChannels: '',
      weeklyServiceDays: '',
      marketplaceReason: '',
      businessDifference: '',
      unhappyClientPlan: '',
      publicClaims: '',
      publicClaimsExplanation: '',
      message: '',
      declarations: {
        truthfulInformation: false,
        noApprovalGuarantee: false,
        additionalVerification: false,
        suspensionUnderstanding: false,
        publicationAuthorization: false,
      },
    };
  }
}
