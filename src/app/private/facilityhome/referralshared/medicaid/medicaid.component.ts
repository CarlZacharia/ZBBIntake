import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationType, MedicaidFormData, MedicaidStatus } from '../referral-shared.types';

@Component({
  selector: 'app-medicaid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicaid.component.html',
  styleUrl: './medicaid.component.css'
})
export class MedicaidComponent implements OnChanges {
  @Input() initialState: MedicaidFormData | null = null;

  readonly medicaidState = signal({
    applicationType: null as ApplicationType,
    filedBy: '',
    caseNumber: '',
    applicationNumber: '',
    dateOfApplication: '',
    dateNeeded: '',
    privatePayEstimate: '',
    status: null as MedicaidStatus,
    lastNoca: '',
    nocaContents: '',
    nocaNotes: ''
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialState']) {
      this.applyInitialState(changes['initialState'].currentValue as MedicaidFormData | null);
    }
  }

  private applyInitialState(state: MedicaidFormData | null): void {
    if (!state) {
      return;
    }

    this.medicaidState.update(current => ({
      ...current,
      applicationType: state.applicationType ?? null,
      filedBy: state.filedBy ?? '',
      caseNumber: state.caseNumber ?? '',
      applicationNumber: state.applicationNumber ?? '',
      dateOfApplication: state.dateOfApplication ?? '',
      dateNeeded: state.dateNeeded ?? '',
      privatePayEstimate: state.privatePayEstimate ?? '',
      status: state.status ?? null,
      lastNoca: state.lastNoca ?? '',
      nocaContents: state.nocaContents ?? '',
      nocaNotes: state.notes ?? ''
    }));
  }

  setApplicationType(type: ApplicationType): void {
    this.medicaidState.update(state => ({
      ...state,
      applicationType: type
    }));
  }

  setStatus(status: MedicaidStatus): void {
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

  getState(): MedicaidFormData {
    const state = this.medicaidState();
    return {
      applicationType: state.applicationType,
      filedBy: state.filedBy,
      caseNumber: state.caseNumber,
      applicationNumber: state.applicationNumber,
      dateOfApplication: state.dateOfApplication,
      dateNeeded: state.dateNeeded,
      privatePayEstimate: state.privatePayEstimate,
      status: state.status,
      lastNoca: state.lastNoca,
      nocaContents: state.nocaContents,
      notes: state.nocaNotes
    };
  }
}

