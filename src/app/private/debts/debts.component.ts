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
      debt_type: 'other',
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
    this.ds.addDebt(this.editingDebt);
    this.closeAddModal();
  }

  saveEditDebt() {
    if (!this.editingDebt || this.editingIndex < 0) return;
    this.ds.updateDebt(this.editingIndex, this.editingDebt);
    this.closeEditModal();
  }

  deleteDebt(index: number) {
    if (!confirm('Are you sure you want to delete this debt?')) return;
    this.ds.removeDebt(index);
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
