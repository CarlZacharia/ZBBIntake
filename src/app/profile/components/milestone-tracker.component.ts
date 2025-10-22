// src/app/profile/widgets/milestone-tracker.component.ts
import { Component, Input } from '@angular/core';
import { NgFor} from '@angular/common';

@Component({
  selector: 'app-milestone-tracker',
  standalone: true,
  imports: [NgFor],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h3 class="card-title">Milestones</h3>
      <ul class="steps steps-vertical lg:steps-horizontal mt-2">
        <li class="step" *ngFor="let m of milestones" [class.step-primary]="m.status !== 'not_started'">
          <span class="text-sm">{{ m.label }}</span>
        </li>
      </ul>
      <div class="mt-3 text-xs opacity-70">Milestones are macro steps (Design, Draft, Signing, Funding).</div>
    </div>
  </div>
  `
})
export class MilestoneTrackerComponent {
  @Input() milestones: any[] = [];
}
