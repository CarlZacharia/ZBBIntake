import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intakehub',
  imports: [CommonModule],
  templateUrl: './intakehub.component.html',
  styleUrl: './intakehub.component.css'
})
export class IntakehubComponent {
  showIntakeOptions = false;

  toggleIntakeOptions() {
    this.showIntakeOptions = !this.showIntakeOptions;
  }
}
