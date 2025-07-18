import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';  // Import the CartService
import { CommonModule } from '@angular/common';
import { CartItem } from '../models/cart-item';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  isVisible = true;
  cartDetails: CartItem[] = [];
  totalPrice: number = 0;

  constructor(private readonly cs: CartService) {}

  ngOnInit() {
    // Subscribe to the cartVisibility$ to track visibility changes
    this.cs.cartVisibility$.subscribe(visible => {
      this.isVisible = visible;
    });

    this.cs.cartDetails$.subscribe((items: CartItem[]) => {
      this.cartDetails = items;
      this.totalPrice = this.cs.getTotal(); // Recalculate total when the cart changes
    });
  }

  toggleCart() {
    this.cs.toggleCart();
  }

  valider() {
    this.cs.validerPanier();
  }

  removeItem(item: CartItem) {
    this.cs.removeItem(item);
  }
}
