import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-summary',
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent {

  // Computed signals for reactive data access
  readonly casedata = computed(() => this.ds.casedata());
  readonly assets = computed(() => this.ds.assets());

  // Computed signal for total asset value
  readonly totalAssetValue = computed(() => {
    let total = 0;
    const assets = this.assets();

    assets.real_estate_holdings.forEach(re => {
      total += re.ownership_value || re.net_value || re.estimated_value || 0;
    });

    assets.financial_account_holdings.forEach(fa => {
      total += fa.approximate_balance || 0;
    });

    assets.retirement_account_holdings.forEach(ra => {
      total += ra.approximate_value || 0;
    });

    assets.life_insurance_holdings.forEach(li => {
      total += li.death_benefit || 0;
    });

    assets.business_interest_holdings.forEach(bi => {
      total += bi.estimated_value || 0;
    });

    assets.digital_asset_holdings.forEach(da => {
      total += da.estimated_value || 0;
    });

    assets.other_asset_holdings.forEach(oa => {
      total += oa.estimated_value || 0;
    });

    return total;
  });

  constructor(public ds: DataService) { }

  // Helper method to format currency
  formatCurrency(value: number | null | undefined): string {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Helper method to format dates
  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Calculate total asset value (backwards compatibility)
  getTotalAssetValue(): number {
    return this.totalAssetValue();
  }

  // Get asset category total with computed signals
  getAssetCategoryTotal(category: string): number {
    const assets = this.assets();
    let total = 0;

    switch (category) {
      case 'real_estate':
        assets.real_estate_holdings.forEach(a => total += a.ownership_value || a.net_value || a.estimated_value || 0);
        break;
      case 'financial':
        assets.financial_account_holdings.forEach(a => total += a.approximate_balance || 0);
        break;
      case 'retirement':
        assets.retirement_account_holdings.forEach(a => total += a.approximate_value || 0);
        break;
      case 'insurance':
        assets.life_insurance_holdings.forEach(a => total += a.death_benefit || 0);
        break;
      case 'business':
        assets.business_interest_holdings.forEach(a => total += a.estimated_value || 0);
        break;
      case 'digital':
        assets.digital_asset_holdings.forEach(a => total += a.estimated_value || 0);
        break;
      case 'other':
        assets.other_asset_holdings.forEach(a => total += a.estimated_value || 0);
        break;
    }

    return total;
  }
}
