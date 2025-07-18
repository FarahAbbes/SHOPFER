import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user } from '@angular/fire/auth';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authenticatedSubject = new BehaviorSubject<boolean>(false);
  readonly authenticated$ = this.authenticatedSubject.asObservable(); // Observable for components to subscribe to
  readonly fireBaseAuth = inject(Auth);
  readonly user$ = user(this.fireBaseAuth);
  readonly currentUserSig: WritableSignal<User | null> = signal<User | null>(null);

  constructor(private readonly router: Router) {}

  // Method to toggle authentication state
  toggleAuth(): void {
    this.authenticatedSubject.next(!this.authenticatedSubject.value); // Toggle the current value
  }
  // Optional: method to get current authentication state
  getAuthState(): boolean {
    return this.authenticatedSubject.value; // Get current authentication state
  }

  register(email: string, userName: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.fireBaseAuth, email, password)
      .then((response) => updateProfile(response.user, { displayName: userName }));
    this.toggleAuth();
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.fireBaseAuth, email, password)
      .then(() => {});
    this.toggleAuth();
    return from(promise);
  }

  async getToken(): Promise<string | null> {
    const currentUser = this.fireBaseAuth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  }

  logout(): void {
    this.toggleAuth();
    this.router.navigate(['/home']);
  }
}
