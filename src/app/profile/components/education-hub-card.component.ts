import { CommonModule } from '@angular/common';
// src/app/profile/widgets/education-hub-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-education-hub-card',
  standalone: true,
  imports: [CommonModule, NgFor],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h3 class="card-title">Education</h3>

      <div role="tablist" class="tabs tabs-bordered mt-2">
        <a role="tab" class="tab tab-active">Recommended</a>
        <a role="tab" class="tab">All</a>
      </div>

      <ul class="mt-3 space-y-3">
        <li *ngFor="let e of items | slice:0:5" class="flex items-start justify-between gap-3">
          <div>
            <div class="font-medium">
              <button class="link link-primary" (click)="open.emit(e.id)">{{ e.title }}</button>
            </div>
            <div class="text-xs opacity-70">{{ e.tag }} • <span *ngIf="e.durationMin">{{ e.durationMin }} min</span></div>
          </div>
          <div>
            <span class="badge badge-outline" *ngIf="e.kind==='video'">Video</span>
            <span class="badge badge-outline" *ngIf="e.kind==='pdf'">PDF</span>
            <span class="badge badge-outline" *ngIf="e.kind==='article'">Article</span>
            <span class="badge badge-outline" *ngIf="e.kind==='book'">Book</span>
          </div>
        </li>
      </ul>

      <div class="card-actions justify-end">
        <a routerLink="/education" class="btn btn-outline btn-sm">View All</a>
      </div>
    </div>
  </div>
  `
})
export class EducationHubCardComponent {
  @Input() items: any[] = [];
  @Output() open = new EventEmitter<string>();
}
