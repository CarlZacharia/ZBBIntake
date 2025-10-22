// src/app/profile/widgets/funding-checklist-card.component.ts
import { Component, Input } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-funding-checklist-card',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h3 class="card-title">Funding Checklist</h3>
      <div class="overflow-x-auto mt-2">
        <table class="table table-zebra">
          <thead>
          <tr><th>Institution</th><th>Account</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of items">
              <td>{{ i.bank }}</td>
              <td>{{ i.accountType }}</td>
              <td>
                <span class="badge"
                  [ngClass]="{
                    'badge-success': i.status==='done',
                    'badge-warning': i.status==='pending',
                    'badge-ghost': i.status==='not_started'
                  }">{{ i.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="text-xs opacity-70 mt-2">Retitle / beneficiary updates help avoid probate and align with your plan.</div>
    </div>
  </div>
  `
})
export class FundingChecklistCardComponent {
  @Input() items: any[] = [];
}
