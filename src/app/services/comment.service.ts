import { Injectable } from '@angular/core';
import { Comment } from '../models/comment';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly storageKey = 'comments'; // Key for local storage
  private readonly commentsSubject = new BehaviorSubject<Comment[]>(this.getCommentsFromLocalStorage()); // Initialize with local storage comments
  comments$ = this.commentsSubject.asObservable(); // Expose comments as observable

constructor(private readonly as: AuthService, private readonly router: Router) {}
  // Fetch comments for a specific product
  getCommentsByProductId(productId: number): Comment[] {
    return this.commentsSubject.value.filter(comment => comment.productId === productId);
  }
  // Add a comment if the user is authenticated
  addComment(newComment: Comment) {
    const isAuthenticated = this.as.getAuthState();
    if (isAuthenticated) {
      const comments = this.commentsSubject.value;
      comments.push(newComment);
      this.commentsSubject.next(comments); // Update the BehaviorSubject
      this.saveCommentsToLocalStorage(comments); // Save to local storage
      console.log('Comment added:', newComment); // Log the new comment
    } else {
      this.router.navigate(['/login']);
    }
  }
  // Helper function to get comments from local storage
  private getCommentsFromLocalStorage(): Comment[] {
    const commentsJson = localStorage.getItem(this.storageKey);
    return commentsJson ? JSON.parse(commentsJson) : [];
  }
  // Helper function to save comments to local storage
  private saveCommentsToLocalStorage(comments: Comment[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(comments));
  }
}
