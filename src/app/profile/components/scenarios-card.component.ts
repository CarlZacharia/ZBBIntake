// src/app/profile/widgets/scenarios-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-scenarios-card',
  standalone: true,
  imports: [NgFor],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h3 class="card-title">Planning Scenarios</h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
        <div *ngFor="let s of presets" class="card bg-base-200">
          <div class="card-body">
            <div class="font-semibold">{{ s.label }}</div>
            <p class="text-sm opacity-80">{{ s.summary }}</p>
            <div class="card-actions justify-end">
              <button class="btn btn-primary btn-sm" (click)="open.emit(s.id)">Open</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ScenariosCardComponent {
  @Input() presets: any[] = [];
  @Output() open = new EventEmitter<string>();
}
