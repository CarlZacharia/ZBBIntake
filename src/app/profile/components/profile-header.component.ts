// src/app/profile/widgets/profile-header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, TitleCasePipe],
  template: `
  <div class="card bg-base-100 shadow-sm rounded-2xl">
  <div class="card-body py-5">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

      <!-- Identity block -->
      <div class="flex items-center gap-4">
        <div class="avatar">
          <div class="w-16 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
            <img [src]="profile?.avatarUrl || '/assets/avatar.svg'" alt="avatar">
          </div>
        </div>
          <button class="btn btn-primary">Primary</button>
  <div class="badge badge-secondary ml-2">Badge</div>
        <div>
          <h1 class="text-xl font-semibold tracking-tight">
            {{ profile?.fullName }}
          </h1>
          <div class="mt-1 flex flex-wrap gap-1.5">
            <span class="badge badge-outline">{{ profile?.maritalStatus | titlecase }}</span>
            <span class="badge badge-outline" *ngFor="let s of profile?.domicileStates">{{ s }}</span>
            <span class="badge badge-primary" *ngFor="let t of profile?.tracks">{{ t }}</span>
          </div>
        </div>
      </div>

      <!-- KPIs + actions -->
      <div class="flex flex-wrap items-center gap-8">

        <!-- Confidence -->
        <div class="text-center">
          <div class="radial-progress text-primary"
               [attr.style]="'--value:' + (profile?.confidenceScore || 0) + '; --size:4rem; --thickness:6px;'">
            <span class="text-sm font-semibold">{{ profile?.confidenceScore || 0 }}%</span>
          </div>
          <div class="mt-1 text-xs opacity-70 tooltip"
               data-tip="Based on completion, critical docs, funding status, and risk answers.">
            Confidence
          </div>
        </div>

        <!-- Next appointment -->
        <div *ngIf="event" class="min-w-[220px]">
          <div class="text-sm font-semibold">Next Appointment</div>
          <div class="text-sm opacity-80">
            {{ event!.startIso | date:'EEE, MMM d, h:mm a' }}
          </div>
          <div class="mt-2">
            <a *ngIf="event!.joinUrl"
               [href]="event!.joinUrl"
               class="btn btn-sm btn-outline">
              Join
            </a>
          </div>
        </div>

        <!-- Actions -->
        <div class="join">
          <button class="btn btn-primary join-item" (click)="newMessage.emit()">Message</button>
          <button class="btn btn-outline join-item" (click)="upload.emit()">Upload</button>
          <button class="btn btn-outline join-item" (click)="schedule.emit()">Schedule</button>
        </div>
      </div>
    </div>
  </div>
</div>
  `
})
export class ProfileHeaderComponent {
  @Input() profile: any;
  @Input() event: any;
  @Output() newMessage = new EventEmitter<void>();
  @Output() upload = new EventEmitter<void>();
  @Output() schedule = new EventEmitter<void>();
}
