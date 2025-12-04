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

  normalized!: NormalizedAssets;
  get clientHeirs() {
    return this.dataService.getClientHeirsArray();
  }
  get spouseHeirs() {
    return this.dataService.getSpouseHeirsArray();
  }


  constructor(
    private dataService: DataService,
    private planningService: PlanningService
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
      other: assets.other_asset_holdings ?? []
    };
    this.normalized = this.planningService.normalizeAssets(normalizedInput);
  }


}
