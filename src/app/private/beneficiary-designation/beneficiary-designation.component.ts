// beneficiary-designation.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import {
  ISelectableHeir,
  IBeneficiaryDesignation,
  OwnershipScenarioOptions,
  getScenarioOptions,
  getAvailableSecondaryHeirs,
  validatePercentages,
  calculateBeneficiaryValues,
  distributeEqually,
  toSelectableHeirs,
  createEmptyDesignation,
  serializeDesignation
} from '../../models/beneficiary-designation.model';

@Component({
  selector: 'app-beneficiary-designation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './beneficiary-designation.component.html',
  styleUrls: ['./beneficiary-designation.component.css']
})
export class BeneficiaryDesignationComponent implements OnInit, OnChanges {

  // Inputs from parent component
  @Input() hasBene: 'Yes' | 'No' | null = null;
  @Input() ownedBy: string | null = null;
  @Input() approximateValue: number = 0;
  @Input() assetName: string = '';
  @Input() existingPrimary: any[] = [];
  @Input() existingSecondary: any[] = [];

  // Output events
  @Output() designationChanged = new EventEmitter<IBeneficiaryDesignation>();
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  // Component state
  designation = signal<IBeneficiaryDesignation>(createEmptyDesignation());
  scenarioOptions = signal<OwnershipScenarioOptions>({
    showClientDiesFirst: true,
    showSpouseDiesFirst: false,
    requireScenarioChoice: false
  });

  // Validation state
  primaryValidation = signal({ isValid: false, total: 0, message: '' });
  secondaryValidation = signal({ isValid: true, total: 0, message: '' });

  // UI state
  currentStep = signal<'structure' | 'scenario' | 'primary' | 'secondary' | 'review'>('structure');

  constructor(private ds: DataService) {}

  ngOnInit(): void {
    this.initializeDesignation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ownedBy']) {
      this.scenarioOptions.set(getScenarioOptions(this.ownedBy));
      this.autoSelectScenario();
    }
    if (changes['approximateValue'] || changes['existingPrimary'] || changes['existingSecondary']) {
      this.initializeDesignation();
    }
  }

  // Computed values
  get isMarried(): boolean {
    return this.ds.isMarried();
  }

  get clientName(): string {
    const p = this.ds.personal();
    return [p.legal_first_name, p.legal_last_name].filter(Boolean).join(' ');
  }

  get spouseName(): string {
    return this.ds.maritalInfo()?.spouse_legal_name || 'Spouse';
  }

  get showBeneficiarySection(): boolean {
    return this.hasBene === 'Yes';
  }

  get availableHeirs(): ISelectableHeir[] {
    const d = this.designation();
    if (d.scenario === 'client_dies_first') {
      return toSelectableHeirs(this.ds.getClientHeirsArray());
    } else if (d.scenario === 'spouse_dies_first') {
      return toSelectableHeirs(this.ds.getSpouseHeirsArray());
    }
    return toSelectableHeirs(this.ds.getClientHeirsArray());
  }

  get availableSecondaryHeirs(): ISelectableHeir[] {
    const d = this.designation();
    return getAvailableSecondaryHeirs(this.availableHeirs, d.primaryBeneficiaries);
  }

  get canProceedToScenario(): boolean {
    return true; // Structure choice is always valid
  }

  get canProceedToPrimary(): boolean {
    const opts = this.scenarioOptions();
    const d = this.designation();
    if (opts.requireScenarioChoice && !d.scenario) return false;
    return true;
  }

  get canProceedToSecondary(): boolean {
    return this.primaryValidation().isValid;
  }

  get canSave(): boolean {
    const d = this.designation();
    if (!this.primaryValidation().isValid) return false;
    if (d.hasSecondary && d.secondaryBeneficiaries.some(b => b.selected)) {
      return this.secondaryValidation().isValid;
    }
    return true;
  }

  // Initialization
  private initializeDesignation(): void {
    const heirs = this.availableHeirs;

    // Map existing beneficiaries if provided
    let primaryHeirs = heirs.map(h => ({ ...h }));
    let secondaryHeirs = heirs.map(h => ({ ...h }));

    if (this.existingPrimary?.length) {
      primaryHeirs = this.mapExistingBeneficiaries(heirs, this.existingPrimary);
    }

    if (this.existingSecondary?.length) {
      secondaryHeirs = this.mapExistingBeneficiaries(heirs, this.existingSecondary);
    }

    this.designation.update(d => ({
      ...d,
      primaryBeneficiaries: primaryHeirs,
      secondaryBeneficiaries: secondaryHeirs,
      hasSecondary: this.isMarried // Default to having secondary if married
    }));

    this.scenarioOptions.set(getScenarioOptions(this.ownedBy));
    this.autoSelectScenario();
    this.updateValidation();
  }

  private mapExistingBeneficiaries(
    heirs: ISelectableHeir[],
    existing: any[]
  ): ISelectableHeir[] {
    return heirs.map(h => {
      const match = existing.find(e => e.heir_id === h.id || e.name === h.name);
      if (match) {
        return {
          ...h,
          selected: true,
          percentage: match.percentage || 0,
          calculatedValue: match.calculated_value || 0,
          perStirpes: match.per_stirpes || false
        };
      }
      return h;
    });
  }

  private autoSelectScenario(): void {
    const opts = this.scenarioOptions();
    if (!opts.requireScenarioChoice) {
      // Auto-select the only available option
      const scenario = opts.showClientDiesFirst ? 'client_dies_first' : 'spouse_dies_first';
      this.designation.update(d => ({ ...d, scenario }));
    }
  }

  // Event handlers
  onStructureChange(hasSecondary: boolean): void {
    this.designation.update(d => ({ ...d, hasSecondary }));
    this.currentStep.set('scenario');
  }

  onScenarioChange(scenario: 'client_dies_first' | 'spouse_dies_first'): void {
    this.designation.update(d => ({ ...d, scenario }));
    // Reinitialize heirs for the selected scenario
    const heirs = scenario === 'client_dies_first'
      ? toSelectableHeirs(this.ds.getClientHeirsArray())
      : toSelectableHeirs(this.ds.getSpouseHeirsArray());

    this.designation.update(d => ({
      ...d,
      primaryBeneficiaries: heirs.map(h => ({ ...h })),
      secondaryBeneficiaries: heirs.map(h => ({ ...h }))
    }));

    this.currentStep.set('primary');
  }

  onPrimaryBeneficiaryToggle(heir: ISelectableHeir): void {
    this.designation.update(d => ({
      ...d,
      primaryBeneficiaries: d.primaryBeneficiaries.map(b =>
        b.id === heir.id ? { ...b, selected: !b.selected } : b
      )
    }));

    // Auto-distribute if equal
    if (this.designation().primaryDistribution === 'equal') {
      this.distributeEquallyPrimary();
    }

    // Update secondary available heirs
    this.updateSecondaryAvailability();
    this.updateValidation();
  }

  onSecondaryBeneficiaryToggle(heir: ISelectableHeir): void {
    this.designation.update(d => ({
      ...d,
      secondaryBeneficiaries: d.secondaryBeneficiaries.map(b =>
        b.id === heir.id ? { ...b, selected: !b.selected } : b
      )
    }));

    // Auto-distribute if equal
    if (this.designation().secondaryDistribution === 'equal') {
      this.distributeEquallySecondary();
    }

    this.updateValidation();
  }

  onDistributionTypeChange(tier: 'primary' | 'secondary', type: 'equal' | 'unequal'): void {
    if (tier === 'primary') {
      this.designation.update(d => ({ ...d, primaryDistribution: type }));
      if (type === 'equal') {
        this.distributeEquallyPrimary();
      }
    } else {
      this.designation.update(d => ({ ...d, secondaryDistribution: type }));
      if (type === 'equal') {
        this.distributeEquallySecondary();
      }
    }
    this.updateValidation();
  }

  onPercentageChange(tier: 'primary' | 'secondary', heirId: string, percentage: number): void {
    if (tier === 'primary') {
      this.designation.update(d => ({
        ...d,
        primaryBeneficiaries: d.primaryBeneficiaries.map(b =>
          b.id === heirId ? { ...b, percentage, calculatedValue: this.approximateValue * (percentage / 100) } : b
        )
      }));
    } else {
      this.designation.update(d => ({
        ...d,
        secondaryBeneficiaries: d.secondaryBeneficiaries.map(b =>
          b.id === heirId ? { ...b, percentage, calculatedValue: this.approximateValue * (percentage / 100) } : b
        )
      }));
    }
    this.updateValidation();
  }

  onPerStirpesChange(tier: 'primary' | 'secondary', heirId: string, value: boolean): void {
    if (tier === 'primary') {
      this.designation.update(d => ({
        ...d,
        primaryBeneficiaries: d.primaryBeneficiaries.map(b =>
          b.id === heirId ? { ...b, perStirpes: value } : b
        )
      }));
    } else {
      this.designation.update(d => ({
        ...d,
        secondaryBeneficiaries: d.secondaryBeneficiaries.map(b =>
          b.id === heirId ? { ...b, perStirpes: value } : b
        )
      }));
    }
  }

  // Distribution helpers
  private distributeEquallyPrimary(): void {
    this.designation.update(d => ({
      ...d,
      primaryBeneficiaries: distributeEqually(d.primaryBeneficiaries).map(b => ({
        ...b,
        calculatedValue: b.selected ? this.approximateValue * (b.percentage / 100) : 0
      }))
    }));
  }

  private distributeEquallySecondary(): void {
    this.designation.update(d => ({
      ...d,
      secondaryBeneficiaries: distributeEqually(d.secondaryBeneficiaries).map(b => ({
        ...b,
        calculatedValue: b.selected ? this.approximateValue * (b.percentage / 100) : 0
      }))
    }));
  }

  private updateSecondaryAvailability(): void {
    const d = this.designation();
    const primarySelectedIds = new Set(
      d.primaryBeneficiaries.filter(b => b.selected).map(b => b.id)
    );

    // If only one primary selected, remove from secondary options
    if (primarySelectedIds.size === 1) {
      this.designation.update(des => ({
        ...des,
        secondaryBeneficiaries: des.secondaryBeneficiaries.map(b =>
          primarySelectedIds.has(b.id) ? { ...b, selected: false } : b
        )
      }));
    }
  }

  private updateValidation(): void {
    const d = this.designation();
    this.primaryValidation.set(validatePercentages(d.primaryBeneficiaries));
    this.secondaryValidation.set(
      d.hasSecondary && d.secondaryBeneficiaries.some(b => b.selected)
        ? validatePercentages(d.secondaryBeneficiaries)
        : { isValid: true, total: 0, message: '' }
    );
  }

  // Navigation
  nextStep(): void {
    const step = this.currentStep();
    switch (step) {
      case 'structure':
        this.currentStep.set('scenario');
        break;
      case 'scenario':
        this.currentStep.set('primary');
        break;
      case 'primary':
        if (this.designation().hasSecondary) {
          this.currentStep.set('secondary');
        } else {
          this.currentStep.set('review');
        }
        break;
      case 'secondary':
        this.currentStep.set('review');
        break;
    }
  }

  prevStep(): void {
    const step = this.currentStep();
    switch (step) {
      case 'scenario':
        this.currentStep.set('structure');
        break;
      case 'primary':
        this.currentStep.set('scenario');
        break;
      case 'secondary':
        this.currentStep.set('primary');
        break;
      case 'review':
        if (this.designation().hasSecondary) {
          this.currentStep.set('secondary');
        } else {
          this.currentStep.set('primary');
        }
        break;
    }
  }

  // Actions
  onSave(): void {
    if (!this.canSave) return;

    const d = this.designation();
    const serialized = serializeDesignation(d);

    this.save.emit({
      ...serialized,
      designation: d
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Utility methods for template
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  getScenarioLabel(scenario: string | null): string {
    if (scenario === 'client_dies_first') {
      return `${this.clientName} Dies First`;
    } else if (scenario === 'spouse_dies_first') {
      return `${this.spouseName} Dies First`;
    }
    return '';
  }

  getHeirTypeIcon(type: string): string {
    switch (type) {
      case 'Spouse': return '💑';
      case 'Client': return '👤';
      case 'Child': return '👶';
      case 'FamilyMember': return '👨‍👩‍👦';
      case 'Charity': return '🏛️';
      default: return '👤';
    }
  }
}
