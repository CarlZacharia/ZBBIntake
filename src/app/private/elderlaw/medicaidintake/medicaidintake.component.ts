import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicaidStepsComponent } from '../medicaidsteps/medicaidsteps.component';

@Component({
  selector: 'app-medicaidintake',
  imports: [CommonModule, MedicaidStepsComponent],
  templateUrl: './medicaidintake.component.html',
  styleUrl: './medicaidintake.component.css'
})
export class MedicaidintakeComponent {

}
