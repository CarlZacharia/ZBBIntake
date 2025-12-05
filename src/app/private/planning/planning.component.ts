// assets-planning.component.ts
import { Component, OnInit } from '@angular/core';
import { PlanningService } from '../../services/planning.service';
import { DataService } from '../../services/data.service'; // your existing service
import { NormalizedAssets } from '../../models/asset.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css'],
})
export class PlanningComponent implements OnInit {
  selectedAsset: any = null;
  normalized!: NormalizedAssets;
  get clientHeirs() {
    return this.dataService.getClientHeirsArray();
  }
  get spouseHeirs() {
    return this.dataService.getSpouseHeirsArray();
  }
  showBeneficiaryModal = false;

  constructor(
    private dataService: DataService,
    private planningService: PlanningService,
  ) {}

  ngOnInit(): void {
    const assets = this.dataService.assets(); // however you fetch them
    const normalizedInput = {
      realEstate: assets.real_estate_holdings ?? [],
      bank: assets.bank_account_holdings ?? [],
      nq: assets.nq_account_holdings ?? [],
      retirement: assets.retirement_account_holdings ?? [],
      lifeInsurance: assets.life_insurance_holdings ?? [],
      business: assets.business_interest_holdings ?? [],
      digital: assets.digital_asset_holdings ?? [],
      other: assets.other_asset_holdings ?? [],
    };
    this.normalized = this.planningService.normalizeAssets(normalizedInput);
  }

  openBeneficiaryModal(asset: any) {
    this.selectedAsset = asset;             // <<— now this property exists
    this.showBeneficiaryModal = true;
  }

  /** USER SAVED BENEFICIARIES */
  onSaveBeneficiaries(result: any) {
    console.log('Saved:', result);

    // attach the data to the asset, or process however you want
    this.selectedAsset.beneficiaries = result;

    this.showBeneficiaryModal = false;
  }

  // Utility to map ownershipForm code to user-friendly label
  ownershipFormLabel(form: string | undefined): string {
    switch (form) {
      case 'TBE':
        return 'Tenants by the Entirety';
      case 'JTWROS':
        return 'Joint Tenants with Right of Survivorship';
      case 'TIC':
        return 'Tenants in Common';
      case 'Sole':
        return 'Sole Ownership';
      default:
        return form || '';
    }
  }
}
