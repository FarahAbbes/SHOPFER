import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { CartItem } from '../models/cart-item';
import { OrderDto } from '../models/order-dto';
import { CommandeService } from './commande.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class CartService {
  /* ---------- State ---------- */
  readonly cartVisibility$ = new BehaviorSubject<boolean>(false);
  readonly cartDetails$    = new BehaviorSubject<CartItem[]>([]);

  /* ---------- Public streams ---------- */
  readonly cartVisibilityObs = this.cartVisibility$.asObservable();
  readonly cartDetailsObs    = this.cartDetails$.asObservable();

  /* ---------- Helpers ---------- */
  private readonly isBrowser: boolean;

  constructor(
    private readonly cmdSrv: CommandeService,
    private readonly authSrv: AuthService,
    private readonly router : Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.restoreCart();
  }

  /* ---------- Cart persistence ---------- */
  private restoreCart(): void {
    if (!this.isBrowser) { return; }
    const data = localStorage.getItem('cartDetails');
    if (data) this.cartDetails$.next(JSON.parse(data));
  }

  private persistCart(): void {
    if (!this.isBrowser) { return; }
    localStorage.setItem('cartDetails', JSON.stringify(this.cartDetails$.value));
  }

  /* ---------- UI helpers ---------- */
  toggleCart(): void {
    this.cartVisibility$.next(!this.cartVisibility$.value);
  }

  /* ---------- Cart mutations ---------- */
  addToCart(item: CartItem): void {
    const list = [...this.cartDetails$.value]; // clone current cart items
    const found = list.find(c => c.product.id === item.product.id);

    if (found) {
      // Increment quantity if item found
      found.qte += item.qte;
    } else {
      // Otherwise, add new item to list
      list.push(item);
    }

    this.cartDetails$.next(list);
    this.persistCart();
  }

  removeItem(item: CartItem): void {
    const list = [...this.cartDetails$.value];
    const idx  = list.findIndex(c => c.product.id === item.product.id);
    if (idx !== -1) {
      if (list[idx].qte > 1) {
        list[idx].qte--;
      } else {
        list.splice(idx, 1);
      }
      this.cartDetails$.next(list);
      this.persistCart();
    }
  }

  clearCart(): void {
    this.cartDetails$.next([]);
    if (this.isBrowser) localStorage.removeItem('cartDetails');
  }

  /* ---------- Business helpers ---------- */
  getTotal(): number {
    return this.cartDetails$.value
      .reduce((total, item) => total + item.product.price * item.qte, 0);
  }

  /* ---------- Checkout ---------- */
  validerPanier(): void {
    if (!this.authSrv.getAuthState()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authSrv.user$
      .pipe(take(1))
      .subscribe((firebaseUser: User | null) => {
        if (!firebaseUser) { return; }

        const total   = this.getTotal();
        const details = this.cartDetails$.value
          .map(it => new OrderDto(it.product.id, it.qte));

        this.cmdSrv.addCommande(firebaseUser.uid, total, details);
        this.clearCart();
      });
  }
}
