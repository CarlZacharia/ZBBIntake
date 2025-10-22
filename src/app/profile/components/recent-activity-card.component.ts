// src/app/profile/widgets/recent-activity-card.component.ts
import { Component, Input } from '@angular/core';
import { DatePipe, NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-recent-activity-card',
  standalone: true,
  imports: [NgFor, NgClass, DatePipe],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h3 class="card-title">Recent Activity</h3>
      <ul class="timeline timeline-vertical mt-2">
        <li *ngFor="let e of events">
          <div class="timeline-start">{{ e.when | date:'MMM d' }}</div>
          <div class="timeline-middle">
            <div class="badge"
              [ngClass]="{
                'badge-info': e.kind==='message',
                'badge-success': e.kind==='upload',
                'badge-warning': e.kind==='status'
              }">&nbsp;</div>
          </div>
          <div class="timeline-end timeline-box">
            <div class="font-medium">{{ e.title }}</div>
            <div class="text-xs opacity-70">{{ e.detail }}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  `
})
export class RecentActivityCardComponent {
  @Input() events: any[] = [];
}
