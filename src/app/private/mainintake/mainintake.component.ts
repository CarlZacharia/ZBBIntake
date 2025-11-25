import { Component, computed } from '@angular/core';
import { PipesModule } from '../../pipes/pipes.module';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PersonalComponent } from '../personal/personal.component';
import { SsnFormatPipe } from '../../pipes/ssn-format.pipe';
import { PhoneFormatPipe } from '../../pipes/phone-format.pipe';
import { ChildrenComponent } from '../children/children.component';
import { CharitiesComponent } from '../charities/charities.component';
import { AssetsComponent } from '../assets/assets.component';
import { SummaryComponent } from './summary/summary.component';
import { DebtsComponent } from '../debts/debts.component';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { IClientData } from '../../models/case_data';

@Component({
  selector: 'app-mainintake',
  imports: [CommonModule, RouterLink, PersonalComponent, ChildrenComponent, CharitiesComponent, AssetsComponent, DebtsComponent, SummaryComponent],
  templateUrl: './mainintake.component.html',
  styleUrl: './mainintake.component.css'
})

export class MainintakeComponent {
  activeSection: string = 'personal';
  constructor(public ds: DataService, private authService: AuthService, private cdr: ChangeDetectorRef) {
    // No assetsChanged observable; rely on Angular reactivity
  }

  // Computed signals for reactive data access
  readonly clientdata = computed(() => this.ds.clientdata());
  readonly personal = computed(() => this.ds.personal());
  readonly maritalInfo = computed(() => this.ds.maritalInfo());
  readonly children = computed(() => this.ds.children());
  readonly assets = computed(() => this.ds.assets());

  // Computed signals for card information
  readonly personalCardInfo = computed(() => {
    const personal = this.personal();
    const marital = this.maritalInfo();
    let info = `${personal.legal_first_name} ${personal.legal_last_name}`;
    if (marital.marital_status === 'Married' && marital.spouse_legal_name) {
      info += ` & ${marital.spouse_legal_name}`;
    }
    return info;
  });

  readonly childrenCount = computed(() => this.clientdata().children.length);
  readonly familyMembersCount = computed(() => this.clientdata().family_members.length);
  readonly charitiesCount = computed(() => this.clientdata().charities.length);
  readonly fiduciariesCount = computed(() => this.clientdata().fiduciaries.length);

  readonly totalAssetValue = computed(() => {
    let total = 0;
    const assets = this.assets();

    // Real Estate
    assets.real_estate_holdings.forEach(re => {
      total += re.approximate_value || 0;
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
      total += li.approximate_value || 0;
    });

    // Business Interests
    assets.business_interest_holdings.forEach(bi => {
      total += bi.approximate_value || 0;
    });

    // Digital Assets
    assets.digital_asset_holdings.forEach(da => {
      total += da.approximate_value || 0;
    });

    // Other Assets
    assets.other_asset_holdings.forEach(oa => {
      total += oa.approximate_value || 0;
    });

    return total;
  });

  // Backwards compatibility getter
  get csd(): IClientData {
    return this.clientdata();
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
