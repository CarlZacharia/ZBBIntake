// src/app/profile/widgets/todo-list.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TodoItem } from '../../models/client_profile';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [NgFor, DatePipe, NgIf, RouterLink],
  template: `
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <h3 class="card-title">To-Dos</h3>
      <span class="badge">{{ openCount }} open</span>
      </div>
      <ul class="mt-2 space-y-2">
        <li *ngFor="let t of items" class="flex items-start gap-3">
          <input type="checkbox" class="checkbox checkbox-sm mt-1" [checked]="t.completed" (change)="toggle.emit(t.id)" />
          <div>
            <div class="font-medium" [class.line-through]="t.completed">
              <a *ngIf="t.link" [routerLink]="t.link" class="link link-primary">{{ t.text }}</a>
              <span *ngIf="!t.link">{{ t.text }}</span>
            </div>
            <div class="text-xs opacity-70">
              <span *ngIf="t.dueIso">Due {{ t.dueIso | date:'MMM d' }}</span>
              <span class="ml-2 badge badge-ghost" *ngIf="t.priority">Priority: {{ t.priority }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  `
})
export class TodoListComponent {
  @Output() toggle = new EventEmitter<string>();
  @Input() items: TodoItem[] = [];

  get openCount(): number {
  // No optional chaining needed because items has a default []
  return this.items.reduce((acc, it) => acc + (it.completed ? 0 : 1), 0);
}
}
