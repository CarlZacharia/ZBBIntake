// plannings1.component.ts - Spouse Passes First Scenario
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanningScenarioService } from '../../../services/planning-scenario.service';
import {
  SpousePassesFirstScenario,
  ScenarioAsset,
} from '../../../models/planning.scenario.model';
import { NormalizedAssets } from '../../../models/asset.model';

@Component({
  selector: 'app-plannings1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plannings1.component.html',
  styleUrls: ['./plannings1.component.css'],
})
export class Plannings1Component implements OnInit {
  @Input() normalizedAssets!: NormalizedAssets;
  @Input() clientName: string = 'Client';
  @Input() spouseName: string = 'Spouse';

  scenario: SpousePassesFirstScenario | null = null;
  expandedAssets: Set<string> = new Set();

  constructor(private scenarioService: PlanningScenarioService) {}

  ngOnInit(): void {
    if (this.normalizedAssets) {
      this.scenarioService.setNames(this.clientName, this.spouseName);
      this.scenario = this.scenarioService.generateSpousePassesFirst(this.normalizedAssets);
    }
  }

  ngOnChanges(): void {
    if (this.normalizedAssets) {
      this.scenarioService.setNames(this.clientName, this.spouseName);
      this.scenario = this.scenarioService.generateSpousePassesFirst(this.normalizedAssets);
    }
  }

  // ============ TOGGLE METHODS ============

  toggleAssetDetails(asset: ScenarioAsset): void {
    const key = `${asset.idname}-${asset.id}`;
    if (this.expandedAssets.has(key)) {
      this.expandedAssets.delete(key);
    } else {
      this.expandedAssets.add(key);
    }
  }

  isExpanded(asset: ScenarioAsset): boolean {
    const key = `${asset.idname}-${asset.id}`;
    return this.expandedAssets.has(key);
  }

  // ============ DISPLAY HELPERS ============

  categoryLabel(category: string | undefined): string {
    switch (category) {
      case 'RealEstate':
        return 'Real Estate';
      case 'Bank':
        return 'Bank Account';
      case 'NQ':
        return 'Non-Qualified Account';
      case 'Retirement':
        return 'Retirement Account';
      case 'LifeInsurance':
        return 'Life Insurance';
      case 'Business':
        return 'Business Interest';
      case 'Digital':
        return 'Digital Asset';
      case 'Other':
        return 'Other Asset';
      default:
        return category || '';
    }
  }

  ownershipFormLabel(form: string | undefined): string {
    switch (form) {
      case 'TBE':
        return 'Tenants by the Entirety';
      case 'JTWROS':
        return 'Joint Tenants w/ Survivorship';
      case 'TIC':
        return 'Tenants in Common';
      case 'Sole Ownership':
        return 'Sole Ownership';
      case 'Trust':
        return 'Trust';
      case 'LLC':
        return 'LLC';
      case 'LifeEstate':
        return 'Life Estate';
      case 'LadyBird':
        return 'Lady Bird Deed';
      case 'LandContract':
        return 'Land Contract';
      default:
        return form || '';
    }
  }

  transferMechanismLabel(mechanism: string): string {
    switch (mechanism) {
      case 'Probate':
        return 'Probate';
      case 'Survivorship':
        return 'Right of Survivorship';
      case 'Beneficiary Designation':
        return 'Beneficiary Designation';
      case 'Life Estate':
        return 'Life Estate';
      case 'Lady Bird Deed':
        return 'Enhanced Life Estate';
      case 'Trust':
        return 'Trust';
      case 'LLC':
        return 'LLC';
      case 'Unaffected':
        return 'Unaffected';
      default:
        return mechanism;
    }
  }

  formatPercent(value: number): string {
    if (value === 1 || value === 100) return '100%';
    if (value < 1) return (value * 100).toFixed(0) + '%';
    return value.toFixed(0) + '%';
  }
}
