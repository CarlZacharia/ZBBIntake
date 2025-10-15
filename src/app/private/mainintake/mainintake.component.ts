import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PersonalComponent } from '../personal/personal.component';
import { ChildrenComponent } from '../children/children.component';
import { CharitiesComponent } from '../charities/charities.component';
import { AssetsComponent } from '../assets/assets.component';
import { SummaryComponent } from './summary/summary.component';
import { DataService } from '../../services/data.service';
import { ICaseData } from '../../models/case_data';

@Component({
  selector: 'app-mainintake',
  imports: [CommonModule, RouterLink, PersonalComponent, ChildrenComponent, CharitiesComponent, AssetsComponent, SummaryComponent],
  templateUrl: './mainintake.component.html',
  styleUrl: './mainintake.component.css'
})
export class MainintakeComponent {
  activeSection: string = 'personal';

  get csd(): ICaseData {
    return this.ds.casedata;
  }

  constructor(public ds: DataService) { }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  // Helper methods for displaying card information
  getPersonalCardInfo() {
    const personal = this.ds.personal;
    const marital = this.ds.maritalInfo;
    let info = `${personal.legal_first_name} ${personal.legal_last_name}`;
    if (marital.marital_status === 'married' && marital.spouse_legal_name) {
      info += ` & ${marital.spouse_legal_name}`;
    }
    return info;
  }

  getChildrenCount() {
    return this.ds.casedata.children.length;
  }

  getFamilyMembersCount() {
    return this.ds.casedata.family_members.length;
  }

  getCharitiesCount() {
    return this.ds.casedata.charities.length;
  }

  getTotalAssetValue() {
    let total = 0;

    // Real Estate
    this.ds.casedata.assets.real_estate_holdings.forEach(re => {
      total += re.estimated_value || 0;
    });

    // Financial Accounts
    this.ds.casedata.assets.financial_account_holdings.forEach(fa => {
      total += fa.approximate_balance || 0;
    });

    // Retirement Accounts
    this.ds.casedata.assets.retirement_account_holdings.forEach(ra => {
      total += ra.approximate_value || 0;
    });

    // Life Insurance
    this.ds.casedata.assets.life_insurance_holdings.forEach(li => {
      total += li.death_benefit || 0;
    });

    // Business Interests
    this.ds.casedata.assets.business_interest_holdings.forEach(bi => {
      total += bi.estimated_value || 0;
    });

    // Digital Assets
    this.ds.casedata.assets.digital_asset_holdings.forEach(da => {
      total += da.estimated_value || 0;
    });

    // Other Assets
    this.ds.casedata.assets.other_asset_holdings.forEach(oa => {
      total += oa.estimated_value || 0;
    });

    return total;
  }

  getFiduciariesCount() {
    return this.ds.casedata.fiduciaries.length;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
