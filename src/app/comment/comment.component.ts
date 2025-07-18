import { Component, OnInit, OnDestroy, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './comment.component.html',
  // styleUrls: ['./comment.component.css'], // si besoin
  encapsulation: ViewEncapsulation.None
})
export class CommentComponent implements OnInit, OnDestroy {
  @Input() productId!: number;
  comments: Comment[] = [];
  showReviewForm: boolean = false;
  reviewForm: FormGroup;
  private commentsSubscription!: Subscription;

  constructor(
    private readonly commentService: CommentService,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly as: AuthService,
    private readonly router: Router
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    if (this.productId != null) {
      // Souscription aux commentaires
      this.commentsSubscription = this.commentService.comments$.subscribe(allComments => {
        console.log('Comments from service:', allComments);
        if (allComments && Array.isArray(allComments)) {
          // Filtrer les commentaires pour ce produit uniquement
          this.comments = allComments.filter(c => c.productId === this.productId);
        } else {
          this.comments = [];
        }
        console.log('Filtered comments:', this.comments);
      });
    }
  }

  openReviewForm() {
    if (this.as.getAuthState()) {
      this.showReviewForm = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  onStarClick(star: number): void {
    this.reviewForm.get('rating')?.setValue(star);
  }

  submitForm() {
    if (this.as.getAuthState()) {
      const newComment: Comment = {
        id: this.comments.length + 1, // À gérer selon ta logique réelle
        productId: this.productId,
        userName: this.as.currentUserSig()?.userName ?? 'anonymous',
        comment: this.reviewForm.get('comment')?.value,
        rating: this.reviewForm.get('rating')?.value,
        createdAt: new Date()
      };

      this.commentService.addComment(newComment);
      this.reviewForm.reset({ rating: null, comment: null }); // reset proprement
      this.showReviewForm = false;
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.commentsSubscription?.unsubscribe();
  }
}
