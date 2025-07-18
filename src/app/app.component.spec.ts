import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
} from '@angular/core/testing';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BehaviorSubject, of } from 'rxjs';
import { signal, WritableSignal, Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { HeaderComponent } from './header/header.component';
import { CartComponent } from './cart/cart.component';

import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { Firestore } from '@angular/fire/firestore';
import { User } from './models/user';

/* ---------- stub components ---------- */
@Component({ selector: 'app-footer', template: '' }) class FooterStub {}
@Component({ selector: 'app-list-product', template: '' }) class ListProductStub {}
@Component({ selector: 'app-sign-in', template: '' }) class SignInStub {}
@Component({ selector: 'app-sign-up', template: '' }) class SignUpStub {}

/* ---------- router mock ---------- */
const routerEvents$ = new BehaviorSubject<any>(null);
const routerMock = {
  events: routerEvents$.asObservable(),
  url: '/home',
  navigate: jasmine.createSpy('navigate'),
};

/* ---------- auth mocks ---------- */
const user$ = new BehaviorSubject<User | null>(null);
const authenticated$ = new BehaviorSubject<boolean>(false);

const currentUserSigVal = signal<User | null>(null);
const currentUserSigSet = jasmine
  .createSpy('set')
  .and.callFake((v: User | null) => currentUserSigVal.set(v));

const authMock = {
  user$: user$.asObservable(),
  authenticated$: authenticated$.asObservable(),
  currentUserSig: Object.assign(() => currentUserSigVal(), {
    set: currentUserSigSet,
    update: jasmine.createSpy('update'),
    asReadonly: jasmine
      .createSpy('asReadonly')
      .and.returnValue(() => currentUserSigVal()),
  }) as unknown as WritableSignal<User | null>,
  logout: jasmine.createSpy('logout'),
};

/* ---------- cart mock ---------- */
const cartMock = {
  cartVisibility$: of(true),
  cartDetails$: of([]),
  getTotal: jasmine.createSpy('getTotal').and.returnValue(0),
  toggleCart: jasmine.createSpy('toggleCart'),
  validerPanier: jasmine.createSpy('validerPanier'),
  removeItem: jasmine.createSpy('removeItem'),
};

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        AppComponent,
        HeaderComponent,
        SearchBarComponent,
        CartComponent,
      ],
      declarations: [
        FooterStub,
        ListProductStub,
        SignInStub,
        SignUpStub,
      ],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} },
        { provide: AuthService, useValue: authMock },
        { provide: CartService, useValue: cartMock },
        { provide: Firestore, useValue: {} },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    user$.next(null);
    authenticated$.next(false);
    currentUserSigSet.calls.reset();
  });

  it('should create the app', () => {
    expect(TestBed.createComponent(AppComponent).componentInstance)
      .withContext('AppComponent instance should exist')
      .toBeTruthy();
  });

  /* --------------------- navbar -------------------- */
  it('hides navbar on /login', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    routerMock.url = '/login';
    routerEvents$.next(new NavigationEnd(1, '/login', '/login'));
    tick();

    expect(app.showNavbar).toBeFalse();
    flush();
  }));

  it('shows navbar on non‑auth route', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    routerMock.url = '/products';
    routerEvents$.next(new NavigationEnd(1, '/products', '/products'));
    tick();

    expect(app.showNavbar).toBeTrue();
    flush();
  }));

  /* --------------- current user --------------- */
  it('sets currentUserSig when user logs in', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const u: User = { email: 'john@example.com', userName: 'John' };
    user$.next(u);
    authenticated$.next(true);
    tick();

    expect(currentUserSigSet).toHaveBeenCalledWith(u);
    const header = fixture.debugElement.query(By.css('app-header')).componentInstance;
    expect(header.Authenticated).toBeTrue();
    flush();
  }));

  it('clears currentUserSig when user logs out', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    user$.next(null);
    authenticated$.next(false);
    tick();

    expect(currentUserSigSet).toHaveBeenCalledWith(null);
    const header = fixture.debugElement.query(By.css('app-header')).componentInstance;
    expect(header.Authenticated).toBeFalse();
    flush();
  }));
});
