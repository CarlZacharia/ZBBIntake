// src/app/profile/widgets/ask-lawyer-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-ask-lawyer-card',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <h3 class="card-title">Ask-a-Lawyer</h3>
        <button class="btn btn-primary btn-sm" (click)="new.emit()">New Message</button>
      </div>
      <ul class="mt-2 divide-y divide-base-300">
        <li *ngFor="let t of threads" class="py-2 flex items-center justify-between">
          <div class="text-sm">
            <div class="font-medium line-clamp-1">{{ t.lastSnippet }}</div>
            <div class="opacity-70">{{ t.updatedIso | date:'MMM d, h:mm a' }}</div>
          </div>
          <div *ngIf="t.unreadCount>0" class="badge badge-secondary">{{ t.unreadCount }} new</div>
        </li>
      </ul>
    </div>
  </div>
  `
})
export class AskLawyerCardComponent {
  @Input() threads: any[] = [];
  @Output() new = new EventEmitter<void>();
}
