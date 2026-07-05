import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './info-page.component.html',
})
export class InfoPageComponent {
  private readonly route = inject(ActivatedRoute);

  get title(): string {
    return this.route.snapshot.data['title'] || 'Pymes Verificadas';
  }

  get description(): string {
    return this.route.snapshot.data['description'] || 'Contenido informativo del marketplace.';
  }

  get cards(): string[] {
    return this.route.snapshot.data['cards'] || [];
  }
}
