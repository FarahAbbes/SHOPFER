import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductItemComponent } from './product-item.component';
import { CartService } from '../services/cart.service';
import { Product } from '../models/product';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProductItemComponent', () => {
  let component: ProductItemComponent;
  let fixture: ComponentFixture<ProductItemComponent>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;

  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    price: 50,
    rating: 4.2,
    thumbnail: 'img.jpg',
    description: 'test desc',
    category: 'Tech',
    discountPercentage: 10,
    stock: 5,
    tags: ['tag'],
    brand: 'Brand'
  };

  beforeEach(async () => {
    cartServiceSpy = jasmine.createSpyObj('CartService', ['addToCart']);

    await TestBed.configureTestingModule({
      imports: [ProductItemComponent, FormsModule, RouterTestingModule],
      providers: [{ provide: CartService, useValue: cartServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductItemComponent);
    component = fixture.componentInstance;
    component.produit = mockProduct;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set Available to true if stock > 0 on ngOnInit', () => {
    component.produit.stock = 10;
    component.ngOnInit();
    expect(component.Available).toBeTrue();
  });

  it('should set Available to false if stock <= 0 on ngOnInit', () => {
    component.produit.stock = 0;
    component.ngOnInit();
    expect(component.Available).toBeFalse();
  });

  it('should return green from getColor() if stock > 0', () => {
    component.produit.stock = 5;
    expect(component.getColor()).toBe('green');
  });

  it('should return red from getColor() if stock <= 0', () => {
    component.produit.stock = 0;
    expect(component.getColor()).toBe('red');
  });

  it('should return correct state from getState()', () => {
    component.produit.stock = 3;
    expect(component.getState()).toBeFalse();

    component.produit.stock = 0;
    expect(component.getState()).toBeTrue();
  });

  it('should increment quantity', () => {
    component.quantity = 1;
    component.incrementQuantity();
    expect(component.quantity).toBe(2);
  });

  it('should decrement quantity but not go below 1', () => {
    component.quantity = 3;
    component.decrementQuantity();
    expect(component.quantity).toBe(2);

    component.quantity = 1;
    component.decrementQuantity();
    expect(component.quantity).toBe(1); // must not go below 1
  });

  it('should call addToCart on addToPanier()', () => {
    spyOn(window, 'alert'); // prevent actual alert popup

    component.addToPanier();

    expect(cartServiceSpy.addToCart).toHaveBeenCalled();
    expect(cartServiceSpy.addToCart.calls.mostRecent().args[0].product.title).toBe('Test Product');
    expect(window.alert).toHaveBeenCalledWith('Test Product added to cart!');
  });

  it('should not call addToCart if produit is undefined in addToPanier', () => {
    component.produit = undefined as any;
    cartServiceSpy.addToCart.calls.reset();
    spyOn(window, 'alert');
    component.addToPanier();
    expect(cartServiceSpy.addToCart).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });
});
