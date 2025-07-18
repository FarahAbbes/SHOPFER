import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { CommentService } from '../services/comment.service';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { Comment } from '../models/comment';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;
  let commentServiceSpy: jasmine.SpyObj<CommentService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockComments: Comment[] = [
    { id: 1, productId: 1, userName: 'user1', comment: 'Nice product!', rating: 5, createdAt: new Date() },
    { id: 2, productId: 2, userName: 'user2', comment: 'Could be better.', rating: 3, createdAt: new Date() }
  ];

  const mockUser = {
    id: 1,
    userName: 'testUser',
    email: 'test@example.com',
    role: 'user'
  };

  beforeEach(async () => {
    commentServiceSpy = jasmine.createSpyObj('CommentService', ['getCommentsByProductId', 'addComment'], {
      comments$: of(mockComments)
    });

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getAuthState', 'currentUserSig']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CommentComponent, ReactiveFormsModule],
      providers: [
        { provide: CommentService, useValue: commentServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.productId = 1;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load and filter comments on init', () => {
    fixture.detectChanges(); // déclenche ngOnInit et subscription
    expect(component.comments.length).toBe(1);
    expect(component.comments[0].productId).toBe(1);
  });

  it('should open review form if user is authenticated', () => {
    authServiceSpy.getAuthState.and.returnValue(true);
    component.openReviewForm();
    expect(component.showReviewForm).toBeTrue();
  });

  it('should redirect to login if user is not authenticated when opening review form', () => {
    authServiceSpy.getAuthState.and.returnValue(false);
    component.openReviewForm();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set rating in form when a star is clicked', () => {
    component.onStarClick(4);
    expect(component.reviewForm.get('rating')?.value).toBe(4);
  });

  it('should submit comment if authenticated', () => {
    authServiceSpy.getAuthState.and.returnValue(true);
    authServiceSpy.currentUserSig.and.returnValue(mockUser);
    component.reviewForm.setValue({ comment: 'Great!', rating: 5 });
    component.comments = []; // simuler état avant ajout

    component.submitForm();

    expect(commentServiceSpy.addComment).toHaveBeenCalledWith(jasmine.objectContaining({
      userName: 'testUser',
      comment: 'Great!',
      rating: 5,
      productId: 1
    }));

    expect(component.showReviewForm).toBeFalse();
    expect(component.reviewForm.get('comment')?.value).toBeNull();
    expect(component.reviewForm.get('rating')?.value).toBeNull();
  });

  it('should redirect to login if not authenticated on submit', () => {
    authServiceSpy.getAuthState.and.returnValue(false);
    component.submitForm();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should unsubscribe from comments$ on destroy', () => {
    fixture.detectChanges();
    spyOn(component['commentsSubscription'], 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component['commentsSubscription'].unsubscribe).toHaveBeenCalled();
  });
});
