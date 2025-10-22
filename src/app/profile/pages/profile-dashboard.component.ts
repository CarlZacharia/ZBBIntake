// src/app/profile/pages/profile-dashboard.component.ts
import { Component, signal } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { ProfileHeaderComponent } from '../components/profile-header.component';
import { MilestoneTrackerComponent } from '../components/milestone-tracker.component';
import { TodoListComponent } from '../components/todo-list.component';
import { EstateMapCardComponent } from '../components/estate-map-card.component';
import { FundingChecklistCardComponent } from '../components/funding-checklist-card.component';
import { EducationHubCardComponent } from '../components/education-hub-card.component';
import { AskLawyerCardComponent } from '../components/ask-lawyer-card.component';
import { NotesCardComponent } from '../components/notes-card.component';
import { ClientVaultCardComponent } from '../components/client-vault-card.component';
import { ScenariosCardComponent } from '../components/scenarios-card.component';
import { RecentActivityCardComponent } from '../components/recent-activity-card.component';

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [
    ProfileHeaderComponent,
    MilestoneTrackerComponent,
    TodoListComponent,
    EstateMapCardComponent,
    FundingChecklistCardComponent,
    EducationHubCardComponent,
    AskLawyerCardComponent,
    NotesCardComponent,
    ClientVaultCardComponent,
    ScenariosCardComponent,
    RecentActivityCardComponent
  ],
  templateUrl: './profile-dashboard.component.html',
})
export class ProfileDashboardComponent {
  profile = signal<any>(null);
  nextEvent = signal<any>(null);
  milestones = signal<any[]>([]);
  todos = signal<any[]>([]);
  education = signal<any[]>([]);
  threads = signal<any[]>([]);
  vault = signal<any[]>([]);
  scenarios = signal<any[]>([]);
  recentActivity = signal<any[]>([]);
  fundingItems = signal<any[]>([]);
  miniMapUrl = signal<string | null>(null);
  notes = signal<string>("");

  constructor(private svc: ProfileService) { }

  ngOnInit() {
    this.svc.loadAll().subscribe(vm => {
      this.profile.set(vm.profile);
      this.nextEvent.set(vm.nextEvent);
      this.milestones.set(vm.milestones);
      this.todos.set(vm.todos);
      this.education.set(vm.education);
      this.threads.set(vm.threads);
      this.vault.set(vm.vault);
      this.scenarios.set(vm.scenarios);
      this.recentActivity.set(vm.activity);
      this.fundingItems.set(vm.funding);
      this.miniMapUrl.set(vm.miniMapUrl);
      this.notes.set(vm.notes || "");
    });
  }

  // Handlers
  composeMessage() { }
  uploadDoc() { }
  scheduleCall() { }
  toggleTodo(id: string) {
    this.todos.update(list => list.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }
  openEducation(id: string) { }
  openVaultItem(id: string) { }
  openScenario(id: string) { }
  saveNotes(text: string) { this.notes.set(text); }
  goToEstateMap() { }
}
