import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-intakehub',
  imports: [CommonModule, RouterLink],
  templateUrl: './intakehub.component.html',
  styleUrl: './intakehub.component.css'
})
export class IntakehubComponent {
  showIntakeOptions: boolean = false;

  toggleIntakeOptions(opt: boolean) {
    console.log(opt);
    this.showIntakeOptions = opt;
  }


}
