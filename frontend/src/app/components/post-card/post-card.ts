import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  @Input() post: any;
  @Input() currentUserId: string = '';
  @Input() currentUserRole: string = '';

  @Output() likeToggled = new EventEmitter<any>();
  @Output() deleteRequested = new EventEmitter<any>();

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

  toggleLike() {
    this.likeToggled.emit(this.post);
  }

  onDelete() {
    this.deleteRequested.emit(this.post);
  }
}
