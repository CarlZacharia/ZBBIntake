// src/app/profile/widgets/client-vault-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-client-vault-card',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h3 class="card-title">Client Vault</h3>
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Uploaded</th><th></th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of docs">
              <td class="font-medium">
                {{ d.name }}
                <span *ngIf="d.signed" class="badge badge-success ml-2">Signed</span>
              </td>
              <td class="uppercase text-xs opacity-70">{{ d.kind }}</td>
              <td class="text-sm">{{ d.uploadedIso | date:'MMM d, y' }}</td>
              <td class="text-right">
                <div class="join">
                  <a *ngIf="d.previewUrl" [href]="d.previewUrl" target="_blank" class="btn btn-sm btn-ghost join-item">Preview</a>
                  <a [href]="d.downloadUrl || '#'" target="_blank" class="btn btn-sm btn-outline join-item">Download</a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-actions justify-end">
        <button class="btn btn-outline btn-sm" (click)="upload.emit()">Upload</button>
      </div>
    </div>
  </div>
  `
})
export class ClientVaultCardComponent {
  @Input() docs: any[] = [];
  @Output() open = new EventEmitter<string>();
  @Output() upload = new EventEmitter<void>();
}
