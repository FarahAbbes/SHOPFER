import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';
import { signal } from '@angular/core';
import { Component } from '@angular/core';

import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { Firestore } from '@angular/fire/firestore';
import { User } from './models/user';

// Stubs simplifiés
@Component({ selector: 'app-header', template: '<div>Header</div>' })
class HeaderStub {
  Authenticated = false;
}

@Component({ selector: 'app-search-bar', template: '<div>SearchBar</div>' })
class SearchBarStub {}

@Component({ selector: 'app-cart', template: '<div>Cart</div>' })
class CartStub {}

@Component({ selector: 'app-footer', template: '<div>Footer</div>' })
class FooterStub {}

@Component({ selector: 'router-outlet', template: '<div>Router Outlet</div>' })
class RouterOutletStub {}

// Dummy components for routing
@Component({ template: '<div>Home</div>' })
class HomeComponent {}

@Component({ template: '<div>Login</div>' })
class LoginComponent {}

describe('AppComponent - Debug Version', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let user$: BehaviorSubject<User | null>;
  let authenticated$: BehaviorSubject<boolean>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Créer les BehaviorSubjects
    user$ = new BehaviorSubject<User | null>(null);
    authenticated$ = new BehaviorSubject<boolean>(false);

    const currentUserSig = signal<User | null>(null);
    const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      user$: user$.asObservable(),
      authenticated$: authenticated$.asObservable(),
      currentUserSig,
    });

    const cartMock = {
      cartVisibility$: of(false),
      cartDetails$: of([]),
      getTotal: jasmine.createSpy('getTotal').and.returnValue(0),
      toggleCart: jasmine.createSpy('toggleCart'),
      validerPanier: jasmine.createSpy('validerPanier'),
      removeItem: jasmine.createSpy('removeItem'),
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'home', component: HomeComponent },
          { path: 'login', component: LoginComponent },
          { path: 'sign-up', component: LoginComponent },
          { path: 'products', component: HomeComponent },
          { path: '', redirectTo: '/home', pathMatch: 'full' }
        ]),
        HttpClientTestingModule,
        AppComponent,
      ],
      declarations: [
        HeaderStub,
        SearchBarStub,
        CartStub,
        FooterStub,
        RouterOutletStub,
        HomeComponent,
        LoginComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: CartService, useValue: cartMock },
        { provide: Firestore, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    // Nettoyer les observables
    user$.complete();
    authenticated$.complete();
    
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize showNavbar to true by default', () => {
    // Vérifier l'état initial avant ngOnInit
    console.log('showNavbar before detectChanges:', component.showNavbar);
    
    fixture.detectChanges(); // Déclenche ngOnInit
    
    console.log('showNavbar after detectChanges:', component.showNavbar);
    
    expect(component.showNavbar).toBe(true);
  });

  it('should hide navbar on auth routes', async () => {
    fixture.detectChanges(); // ngOnInit
    
    // Test /login
    await router.navigate(['/login']);
    fixture.detectChanges();
    console.log('showNavbar for /login:', component.showNavbar);
    expect(component.showNavbar).toBe(false);
    
    // Test /sign-up  
    await router.navigate(['/sign-up']);
    fixture.detectChanges();
    console.log('showNavbar for /sign-up:', component.showNavbar);
    expect(component.showNavbar).toBe(false);
    
    // Test route normale
    await router.navigate(['/products']);
    fixture.detectChanges();
    console.log('showNavbar for /products:', component.showNavbar);
    expect(component.showNavbar).toBe(true);
  });

  it('should update currentUserSig when user changes', () => {
    fixture.detectChanges(); // ngOnInit
    
    const testUser: User = {
      email: 'test@example.com',
      userName: 'TestUser'
    };
    
    // Emit user
    user$.next(testUser);
    fixture.detectChanges();
    
    expect(authService.currentUserSig()).toEqual({
      email: 'test@example.com',
      userName: 'TestUser'
    });
    
    // Emit null user
    user$.next(null);
    fixture.detectChanges();
    
    expect(authService.currentUserSig()).toBeNull();
  });

  it('should handle user with missing properties', () => {
    fixture.detectChanges(); // ngOnInit
    
    const incompleteUser = {
      email: null,
      userName: undefined
    } as any;
    
    user$.next(incompleteUser);
    fixture.detectChanges();
    
    expect(authService.currentUserSig()).toEqual({
      email: '',
      userName: 'Guest'
    });
  });
});