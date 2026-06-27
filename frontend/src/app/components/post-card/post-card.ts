import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Publication } from '../../core/services/publication';
import { Auth } from '../../core/services/auth';
import { AvatarFallbackPipe } from '../../core/pipes/avatar-fallback.pipe';
import { TimeAgoPipe } from '../../core/pipes/time-ago.pipe';
import { ImgFallbackDirective } from '../../core/directives/img-fallback.directive';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarFallbackPipe, TimeAgoPipe, ImgFallbackDirective],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  @Input() post: any;
  @Input() currentUserId: string = '';
  @Input() currentUserRole: string = '';

  @Output() likeToggled = new EventEmitter<any>();
  @Output() deleteRequested = new EventEmitter<any>();

  constructor(
    private readonly publicationService: Publication,
    private readonly auth: Auth,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get isLiked(): boolean {
    if (!this.post || !this.post.likes || !this.currentUserId) return false;
    return this.post.likes.includes(this.currentUserId);
  }

  get canDelete(): boolean {
    if (!this.post || !this.currentUserId) return false;
    const authorId = this.post.autor?._id || this.post.autor?.id || this.post.autor;
    return authorId === this.currentUserId || this.currentUserRole === 'administrador';
  }

  get authorName(): string {
    if (!this.post || !this.post.autor) return 'Usuario Desconocido';
    return `${this.post.autor.nombre} ${this.post.autor.apellido}`;
  }

  get authorAvatar(): string {
    return this.post?.autor?.imgUrl || '';
  }

  goToDetail() {
    this.router.navigate(['/publicaciones', this.post._id]);
  }

  toggleLike() {
    this.likeToggled.emit(this.post);
  }

  onDelete() {
    this.deleteRequested.emit(this.post);
  }
}
