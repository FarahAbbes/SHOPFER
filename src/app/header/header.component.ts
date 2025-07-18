import { Component } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { CartService } from '../services/cart.service';
import { CartComponent } from '../cart/cart.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchBarComponent,CartComponent,RouterLink,CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  Authenticated: boolean = false;

  constructor(private readonly cs: CartService, private readonly authService: AuthService) {}

  ngOnInit() {
    // Subscribe to the authentication state
    this.authService.authenticated$.subscribe(auth => {
      this.Authenticated = auth;
    });
  }

  toggleCart() {
    this.cs.toggleCart();
  }

  toggleAuth() {
    this.authService.logout(); // Call the method in AuthService
  }
}
