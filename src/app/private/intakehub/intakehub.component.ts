import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-intakehub',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './intakehub.component.html',
  styleUrl: './intakehub.component.css'
})
export class IntakehubComponent {
  showIntakeOptions: boolean = false;

  constructor(private authService: AuthService) { }

  toggleIntakeOptions(opt: boolean) {
    console.log(opt);
    this.showIntakeOptions = opt;
  }

  logout(): void {
    this.authService.logout();
  }
}
