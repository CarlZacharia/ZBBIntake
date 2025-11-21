import { Component, computed } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PersonalComponent } from '../personal/personal.component';
import { ChildrenComponent } from '../children/children.component';
import { CharitiesComponent } from '../charities/charities.component';
import { AssetsComponent } from '../assets/assets.component';
import { SummaryComponent } from './summary/summary.component';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ICaseData } from '../../models/case_data';

@Component({
  selector: 'app-mainintake',
  imports: [CommonModule, RouterLink, PersonalComponent, ChildrenComponent, CharitiesComponent, AssetsComponent, SummaryComponent],
  templateUrl: './mainintake.component.html',
  styleUrl: './mainintake.component.css'
})

export class MainintakeComponent {
  activeSection: string = 'personal';
  constructor(public ds: DataService, private authService: AuthService, private cdr: ChangeDetectorRef) {
    // No assetsChanged observable; rely on Angular reactivity
  }

  // Computed signals for reactive data access
  readonly casedata = computed(() => this.ds.casedata());
  readonly personal = computed(() => this.ds.personal());
  readonly maritalInfo = computed(() => this.ds.maritalInfo());
  readonly children = computed(() => this.ds.children());
  readonly assets = computed(() => this.ds.assets());

  // Computed signals for card information
  readonly personalCardInfo = computed(() => {
    const personal = this.personal();
    const marital = this.maritalInfo();
    let info = `${personal.legal_first_name} ${personal.legal_last_name}`;
    if (marital.marital_status === 'married' && marital.spouse_legal_name) {
      info += ` & ${marital.spouse_legal_name}`;
    }
    return info;
  });

  readonly childrenCount = computed(() => this.casedata().children.length);
  readonly familyMembersCount = computed(() => this.casedata().family_members.length);
  readonly charitiesCount = computed(() => this.casedata().charities.length);
  readonly fiduciariesCount = computed(() => this.casedata().fiduciaries.length);

  readonly totalAssetValue = computed(() => {
    let total = 0;
    const assets = this.assets();

    // Real Estate
    assets.real_estate_holdings.forEach(re => {
      total += re.estimated_value || 0;
    });

    // Bank Accounts
    assets.bank_account_holdings.forEach(ba => {
      total += ba.approximate_value || 0;
    });

    // Non-Qualified Accounts
    assets.nq_account_holdings.forEach(nq => {
      total += nq.approximate_value || 0;
    });

    // Retirement Accounts
    assets.retirement_account_holdings.forEach(ra => {
      total += ra.approximate_value || 0;
    });

    // Life Insurance
    assets.life_insurance_holdings.forEach(li => {
      total += li.death_benefit || 0;
    });

    // Business Interests
    assets.business_interest_holdings.forEach(bi => {
      total += bi.estimated_value || 0;
    });

    // Digital Assets
    assets.digital_asset_holdings.forEach(da => {
      total += da.estimated_value || 0;
    });

    // Other Assets
    assets.other_asset_holdings.forEach(oa => {
      total += oa.estimated_value || 0;
    });

    return total;
  });

  // Backwards compatibility getter
  get csd(): ICaseData {
    return this.casedata();
  }

  // (moved to above)

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  // Helper methods for displaying card information (backwards compatibility)
  getPersonalCardInfo() {
    return this.personalCardInfo();
  }

  getChildrenCount() {
    return this.childrenCount();
  }

  getFamilyMembersCount() {
    return this.familyMembersCount();
  }

  getCharitiesCount() {
    return this.charitiesCount();
  }

  getTotalAssetValue() {
    return this.totalAssetValue();
  }

  getFiduciariesCount() {
    return this.fiduciariesCount();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  logout(): void {
    this.authService.logout();
  }
}
