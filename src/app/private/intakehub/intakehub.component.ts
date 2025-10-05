import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intakehub',
  imports: [CommonModule],
  templateUrl: './intakehub.component.html',
  styleUrl: './intakehub.component.css'
})
export class IntakehubComponent {
  showtemplate: string = 'vision';

  toggleIntakeOptions(option: string) {
    if (option == 'vision') {
      this.showtemplate = 'vision';
    } else if (option == 'intake') {
      this.showtemplate = 'intakeOptions';
    }
  }
}
