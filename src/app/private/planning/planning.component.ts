import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent {
  constructor(public ds: DataService) {}

  // Heirs arrays
  get clientHeirs() {
    return this.ds.getClientHeirsArray();
  }
  get spouseHeirs() {
    return this.ds.getSpouseHeirsArray();
  }

  // All assets
  get assets() {
    return this.ds.assets();
  }

  // Group assets by title_holding, with unified group for beneficiary designation/TOD/POD
  get groupedAssets() {
    const allAssets = [
      ...(this.assets.real_estate_holdings || []),
      ...(this.assets.bank_account_holdings || []),
      ...(this.assets.nq_account_holdings || []),
      ...(this.assets.retirement_account_holdings || []),
      ...(this.assets.life_insurance_holdings || []),
      ...(this.assets.business_interest_holdings || []),
      ...(this.assets.digital_asset_holdings || []),
      ...(this.assets.other_asset_holdings || [])
    ];
    // Normalize title_holding for grouping
    const groupMap: { [key: string]: any[] } = {};
    allAssets.forEach(asset => {
      let group = (asset.dispo_type || '').toLowerCase();
      if (["beneficiary designation", "tod", "pod"].includes(group)) {
        group = "beneficiary/tod/pod";
      }
      if (!group) group = 'other';
      if (!groupMap[group]) groupMap[group] = [];
      groupMap[group].push(asset);
    });
    // Console log each group and its assets
    Object.entries(groupMap).forEach(([group, assets]) => {
      console.log(`Group: ${group}`);
      console.log(assets);
    });
    return groupMap;
  }
}
