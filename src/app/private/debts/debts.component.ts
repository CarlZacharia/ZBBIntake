import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { IDebt } from '../../models/case_data';

@Component({
  selector: 'app-debts',
  imports: [CommonModule, FormsModule],
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.css']
})
export class DebtsComponent {
    readonly totalDebts;
  showAddModal = false;
  showEditModal = false;
  editingDebt: IDebt | null = null;
  editingIndex: number = -1;

  readonly debts = computed(() => this.ds.debts());

  constructor(public ds: DataService) {
    this.totalDebts = this.ds.totalDebts;
  }

  openAddModal() {
    this.editingDebt = {
      debt_id: null,
      debt_type: 'Credit card',
      creditor_name: '',
      account_number: null,
      original_amount: null,
      current_balance: null,
      monthly_payment: null,
      notes: '',
      owned_by: null
    };
    this.showAddModal = true;
  }

  openEditModal(index: number) {
    const debt = this.debts()[index];
    this.editingDebt = { ...debt };
    this.editingIndex = index;
    this.showEditModal = true;
  }

  saveNewDebt() {
      if (!this.editingDebt) return;
      this.ds.saveDebt('insert', this.editingDebt).subscribe({
        next: () => {
          this.closeAddModal();
          this.ds.refreshDebts();
        },
        error: err => {
          alert('Failed to add debt: ' + err.message);
        }
      });
  }

  saveEditDebt() {
      if (!this.editingDebt || this.editingIndex < 0) return;
      this.ds.saveDebt('update', this.editingDebt).subscribe({
        next: () => {
          this.closeEditModal();
          this.ds.refreshDebts();
        },
        error: err => {
          alert('Failed to update debt: ' + err.message);
        }
      });
  }

  deleteDebt(index: number) {
      if (!confirm('Are you sure you want to delete this debt?')) return;
      const debt = this.debts()[index];
      this.ds.saveDebt('delete', debt).subscribe({
        next: () => {
          this.ds.refreshDebts();
        },
        error: err => {
          alert('Failed to delete debt: ' + err.message);
        }
      });
  }

  closeAddModal() {
    this.showAddModal = false;
    this.editingDebt = null;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingDebt = null;
    this.editingIndex = -1;
  }
}
