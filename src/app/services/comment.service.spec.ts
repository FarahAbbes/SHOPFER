import { TestBed } from '@angular/core/testing';
import { CommentService } from './comment.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Comment } from '../models/comment';

describe('CommentService', () => {
  let service: CommentService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockComment: Comment = {
    id: 1,
    productId: 101,
    userName: 'John Doe',
    comment: 'Excellent produit',
    rating: 5,
    createdAt: new Date()
  };

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getAuthState']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        CommentService,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(CommentService);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    localStorage.clear(); // Reset localStorage before each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should add a comment if user is authenticated', () => {
    authServiceSpy.getAuthState.and.returnValue(true);

    service.addComment(mockComment);

    const stored = JSON.parse(localStorage.getItem('comments') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].userName).toBe('John Doe');
  });

  it('should not add a comment and redirect to login if not authenticated', () => {
    authServiceSpy.getAuthState.and.returnValue(false);

    service.addComment(mockComment);

    const stored = JSON.parse(localStorage.getItem('comments') || '[]');
    expect(stored.length).toBe(0);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return empty array when no comments in localStorage', () => {
    const comments = service['getCommentsFromLocalStorage']();
    expect(comments).toEqual([]);
  });

  it('should save comments to localStorage', () => {
    service['saveCommentsToLocalStorage']([mockComment]);

    const stored = JSON.parse(localStorage.getItem('comments') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].rating).toBe(5);
  });


});
