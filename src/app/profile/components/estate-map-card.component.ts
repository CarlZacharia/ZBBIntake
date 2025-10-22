// src/app/profile/widgets/estate-map-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-estate-map-card',
  standalone: true,
  imports: [],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <figure class="max-h-48 overflow-hidden bg-base-200">
      <img [src]="miniMapUrl || '/assets/estate-map-placeholder.png'" alt="Estate Map preview" class="w-full object-cover">
    </figure>
    <div class="card-body">
      <h3 class="card-title">Visual Estate Map</h3>
      <p class="text-sm opacity-80">Family relationships, assets, and distribution flows (now, first death, second death).</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary" (click)="open.emit()">Open Map</button>
      </div>
    </div>
  </div>
  `
})
export class EstateMapCardComponent {
  @Input() miniMapUrl: string | null = null;
  @Output() open = new EventEmitter<void>();
}
