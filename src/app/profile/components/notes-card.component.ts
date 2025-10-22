// src/app/profile/widgets/notes-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notes-card',
  standalone: true,
  imports: [FormsModule],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <h3 class="card-title">My Notes</h3>
      <textarea [(ngModel)]="text" rows="4" class="textarea textarea-bordered w-full" placeholder="Jot questions or reminders..."></textarea>
      <div class="card-actions justify-end">
        <button class="btn btn-outline btn-sm" (click)="save.emit(text)">Save</button>
      </div>
    </div>
  </div>
  `
})
export class NotesCardComponent {
  @Input() set notes(v: string) { this.text = v || ''; }
  @Output() save = new EventEmitter<string>();
  text = '';
}
