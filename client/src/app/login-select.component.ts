import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-select',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login-select.component.html',
})
export class LoginSelectComponent {}
