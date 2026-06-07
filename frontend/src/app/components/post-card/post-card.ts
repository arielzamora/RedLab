import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Publication } from '../../core/services/publication';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  @Input() post: any;
  @Input() currentUserId: string = '';
  @Input() currentUserRole: string = '';

  @Output() likeToggled = new EventEmitter<any>();
  @Output() deleteRequested = new EventEmitter<any>();

  nuevoComentario = '';
  showComments = false;

  constructor(
    private readonly publicationService: Publication,
    private readonly auth: Auth,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get isLiked(): boolean {
    return this.post?.likes?.includes(this.currentUserId);
  }

  get canDelete(): boolean {
    if (!this.post || !this.currentUserId) return false;
    return this.post.autor?._id === this.currentUserId || this.currentUserRole === 'administrador';
  }

  get authorName(): string {
    if (!this.post || !this.post.autor) return 'Usuario Desconocido';
    return `${this.post.autor.nombre} ${this.post.autor.apellido}`;
  }

  get authorAvatar(): string {
    return this.post?.autor?.imgUrl || '';
  }

  get currentUserAvatar(): string {
    const user = this.auth.getCurrentUser();
    return user?.imgUrl || '';
  }

  toggleCommentsVisibility() {
    this.showComments = !this.showComments;
    this.cdr.markForCheck();
  }

  toggleLike() {
    this.likeToggled.emit(this.post);
  }

  onDelete() {
    this.deleteRequested.emit(this.post);
  }

  agregarComentario() {
    if (!this.nuevoComentario.trim()) return;
    this.publicationService.addComment(this.post._id, this.nuevoComentario).subscribe({
      next: (response: any) => {
        const updatedPost = response.data || response;
        this.post.comentarios = updatedPost.comentarios;
        this.nuevoComentario = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al agregar comentario:', err);
        this.cdr.markForCheck();
      }
    });
  }
}
