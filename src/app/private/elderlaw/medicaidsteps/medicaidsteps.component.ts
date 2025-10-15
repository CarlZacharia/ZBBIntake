import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MaapStep {
  id: number;
  title: string;
  content: string;
  isOpen: boolean;
  bgColor: string;
  hoverColor: string;
  borderColor: string;
  textColor: string;
}

@Component({
  selector: 'app-medicaid-steps',
  imports: [CommonModule],
  templateUrl: './medicaidsteps.component.html',
  styleUrl: './medicaidsteps.component.css'
})
export class MedicaidStepsComponent implements OnInit {
  steps: MaapStep[] = [
    {
      id: 1,
      title: 'Secure the Legal Foundation: Power of Attorney (POA)',
      content: `The Power of Attorney (POA) is the single most critical document. Without a properly executed POA, no one, not even a spouse or child, has the legal authority to execute the necessary asset transfers or sign the application on the applicant's behalf. <strong>If a valid POA is not in place, the application process cannot move forward.</strong>`,
      isOpen: false,
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-800'
    },
    {
      id: 2,
      title: 'The Lookback Test: Transfers for Less Than Fair Market Value',
      content: `Medicaid will review all financial transactions for the <strong>5-year period</strong> preceding the application date. Any transfer of assets for less than their fair market value (i.e., gifts) can trigger a penalty period, delaying eligibility. This must be ascertained immediately to plan around any potential penalties.`,
      isOpen: false,
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-800'
    },
    {
      id: 3,
      title: 'Income Test: Determine Need for a Qualified Income Trust (QIT)',
      content: `<p class="mb-3">Compare the applicant's total monthly income (including Social Security, pensions, etc.) against the allowed threshold amount (currently <strong>$2,901 in 2024</strong>).</p>
      <ul class="list-disc list-inside space-y-2 ml-4 mb-3">
        <li><span class="font-semibold text-emerald-700">If Income is UNDER $2,901:</span> A QIT is <strong>not</strong> necessary.</li>
        <li><span class="font-semibold text-red-700">If Income is OVER $2,901:</span> A QIT <strong>must</strong> be established and funded monthly to manage the excess income.</li>
      </ul>
      <p class="text-sm italic"><strong>Note on IRAs:</strong> If the applicant has an IRA or 401k in payout mode, the payments are counted as income and could push a seemingly eligible applicant over the income limit, making a QIT necessary.</p>`,
      isOpen: false,
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-800'
    },
    {
      id: 4,
      title: 'Comprehensive Review: Assets, Debts, Income, and Expenses',
      content: `Gather documentation for every financial account (bank statements, brokerage accounts), property deed, insurance policy, debt (mortgage, credit cards), and income/expense record. Accuracy is non-negotiable.`,
      isOpen: false,
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-800'
    },
    {
      id: 5,
      title: 'Asset Triage: Countable, Non-Countable, or Income-Only',
      content: `<p class="mb-3">Every asset must be valued and placed into one of three categories to determine the spenddown amount:</p>
      <ul class="list-disc list-inside space-y-2 ml-4">
        <li><strong>Countable:</strong> Must be reduced to meet the $2,000 limit (e.g., non-retirement bank accounts, stocks, bonds).</li>
        <li><strong>Non-Countable (Exempt):</strong> Does not count against the $2,000 limit (e.g., primary residence, one vehicle, certain burial arrangements).</li>
        <li><strong>Countable as Income Only:</strong> Treated as income, not assets (e.g., IRA or 401k in specific distribution status).</li>
      </ul>`,
      isOpen: false,
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-800'
    },
    {
      id: 6,
      title: 'Calculate the Spenddown Target',
      content: `<p class="mb-4">Subtract the <strong>$2,000</strong> asset limit from the total value of all <strong>Countable Assets</strong>. The result is the total amount that must be "spent down" before the application can be approved.</p>
      <div class="p-3 bg-amber-50 border border-amber-300 rounded-lg">
        <p class="font-bold text-amber-900">Countable Assets - $2,000 = Spenddown Amount</p>
      </div>`,
      isOpen: false,
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-800'
    },
    {
      id: 7,
      title: 'Level 1 Spenddown: Priority Debts and Nursing Home Payments',
      content: `<p class="mb-3">The first portion of the Spenddown Amount is used for essential and priority payments:</p>
      <ul class="list-disc list-inside space-y-2 ml-4 mb-3">
        <li><strong>Priority Debts:</strong> Existing legal debts (e.g., back taxes, loans, credit cards).</li>
        <li><strong>Nursing Home Payments:</strong> The nursing home bill must be paid up to the <strong>Goal Date</strong> (the planned date of successful Medicaid eligibility).</li>
      </ul>
      <p class="text-sm italic">This reduces the total Spenddown Amount but does not use preservation strategies.</p>`,
      isOpen: false,
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-800'
    },
    {
      id: 8,
      title: 'Calculate Level 2 Spenddown: The Preservation Amount',
      content: `After Level 1 payments are made, the remaining balance is the <strong>Level 2 Spenddown</strong> amount. This is the amount we will focus on <strong>preserving</strong> using legally exempt strategies to benefit the family or the applicant.`,
      isOpen: false,
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-800'
    },
    {
      id: 9,
      title: 'Execute Spenddown: Preserve the Remaining Assets',
      content: `<p class="mb-3 font-semibold">The Level 2 amount is spent using strategies that either benefit exempt persons or convert the asset to an exempt form, thereby reducing the countable assets to $2,000 (or less) without triggering a penalty:</p>
      <ul class="list-disc list-inside space-y-2 ml-4 mb-4">
        <li><strong>Exempt Transfers:</strong> Giving assets to exempt individuals (e.g., a child who provides care).</li>
        <li><strong>Exempt Purchases:</strong> Making purchases that are not counted (e.g., pre-paying funeral expenses, paying off debt on the exempt home).</li>
        <li><strong>Asset Conversion:</strong> Turning a countable asset into an exempt asset (e.g., buying a new exempt vehicle or making home repairs).</li>
      </ul>
      <p class="font-bold text-cyan-800">Once Level 2 Spenddown is complete, the applicant is financially eligible, and the application can be submitted with a high probability of approval on the Goal Date.</p>`,
      isOpen: false,
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-900'
    }
  ];

  ngOnInit(): void {
    // Open first step by default
    if (this.steps.length > 0) {
      this.steps[0].isOpen = true;
    }
  }

  toggleStep(stepId: number): void {
    const clickedStep = this.steps.find(s => s.id === stepId);

    if (clickedStep) {
      // If clicking an already open step, just close it
      if (clickedStep.isOpen) {
        clickedStep.isOpen = false;
      } else {
        // Close all steps
        this.steps.forEach(s => s.isOpen = false);
        // Open clicked step
        clickedStep.isOpen = true;
      }
    }
  }
}

