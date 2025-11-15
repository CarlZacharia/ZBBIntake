import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ApplicationType = 'new' | 'renewal';
type StatusType = 'notFiled' | 'filed' | 'pending' | 'denied' | 'unsure';

@Component({
  selector: 'app-medicaid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicaid.component.html',
  styleUrl: './medicaid.component.css'
})
export class MedicaidComponent {
  readonly medicaidState = signal({
    applicationType: null as ApplicationType | null,
    filedBy: '',
    caseNumber: '',
    applicationNumber: '',
    dateOfApplication: '',
    dateNeeded: '',
    privatePayEstimate: '',
    status: null as StatusType | null,
    lastNoca: '',
    nocaContents: '',
    nocaNotes: ''
  });

  setApplicationType(type: ApplicationType): void {
    this.medicaidState.update(state => ({
      ...state,
      applicationType: type
    }));
  }

  setStatus(status: StatusType): void {
    this.medicaidState.update(state => ({
      ...state,
      status
    }));
  }

  updateField<K extends keyof ReturnType<typeof this.medicaidState>>(key: K, value: ReturnType<typeof this.medicaidState>[K]): void {
    this.medicaidState.update(state => ({
      ...state,
      [key]: value
    }));
  }
}

