import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Publication } from '../../core/services/publication';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.scss',
})
export class PublicacionDetalle implements OnInit {
  postId = '';
  post = signal<any>(null);
  comments = signal<any[]>([]);
  
  // Pagination
  commentsLimit = 5;
  commentsOffset = 0;
  totalCommentsCount = 0;
  
  // Comment entry
  nuevoComentario = '';
  isSubmittingComment = false;
  
  // Edit comment state
  editingCommentId = '';
  editingCommentText = '';

  currentUser: any = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly publicationService: Publication,
    private readonly auth: Auth,
    private readonly cdr: ChangeDetectorRef
  ) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.currentUser = this.auth.getCurrentUser();
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.postId = params.get('id') || '';
      if (this.postId) {
        this.loadPost();
        this.loadComments(true);
      }
    });
  }

  loadPost() {
    this.publicationService.getPublicationById(this.postId).subscribe({
      next: (response: any) => {
        this.post.set(response.data || response);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar la publicación:', err);
        this.router.navigate(['/publicaciones']);
      }
    });
  }

  loadComments(reset = false) {
    if (reset) {
      this.commentsOffset = 0;
    }
    this.publicationService.getComments(this.postId, this.commentsLimit, this.commentsOffset).subscribe({
      next: (response: any) => {
        const resData = response.data || response;
        const total = response.total !== undefined ? response.total : 0;
        
        this.totalCommentsCount = total;
        if (reset) {
          this.comments.set(resData);
        } else {
          this.comments.update(prev => [...prev, ...resData]);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar comentarios:', err);
      }
    });
  }

  loadMore() {
    this.commentsOffset = this.comments().length;
    this.loadComments(false);
  }

  get isLiked(): boolean {
    const p = this.post();
    const userId = this.currentUser?.id || this.currentUser?._id;
    return p?.likes?.includes(userId);
  }

  toggleLike() {
    const p = this.post();
    if (!p) return;
    const userId = this.currentUser?.id || this.currentUser?._id;
    const isLiked = p.likes.includes(userId);
    
    if (isLiked) {
      this.publicationService.unlikePublication(p._id).subscribe({
        next: (response: any) => {
          this.post.set(response.data || response);
          this.cdr.markForCheck();
        }
      });
    } else {
      this.publicationService.likePublication(p._id).subscribe({
        next: (response: any) => {
          this.post.set(response.data || response);
          this.cdr.markForCheck();
        }
      });
    }
  }

  agregarComentario() {
    if (!this.nuevoComentario.trim() || this.isSubmittingComment) return;
    this.isSubmittingComment = true;
    this.cdr.markForCheck();
    
    this.publicationService.addComment(this.postId, this.nuevoComentario.trim()).subscribe({
      next: () => {
        this.isSubmittingComment = false;
        this.nuevoComentario = '';
        // Reload comments list from scratch to show the new comment
        this.loadComments(true);
        // Refresh post stats
        this.loadPost();
      },
      error: (err) => {
        this.isSubmittingComment = false;
        console.error('Error al agregar comentario:', err);
        this.cdr.markForCheck();
      }
    });
  }

  iniciarEdicion(comment: any) {
    this.editingCommentId = comment._id;
    this.editingCommentText = comment.texto;
    this.cdr.markForCheck();
  }

  cancelarEdicion() {
    this.editingCommentId = '';
    this.editingCommentText = '';
    this.cdr.markForCheck();
  }

  guardarEdicion(commentId: string) {
    if (!this.editingCommentText.trim()) return;
    this.publicationService.editComment(this.postId, commentId, this.editingCommentText.trim()).subscribe({
      next: (response: any) => {
        const updated = response.data || response;
        this.comments.update(prev => prev.map(c => c._id === commentId ? { ...c, texto: updated.texto, modificado: true } : c));
        this.editingCommentId = '';
        this.editingCommentText = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al editar comentario:', err);
      }
    });
  }

  get authorName(): string {
    const p = this.post();
    if (!p || !p.autor) return 'Usuario Desconocido';
    return `${p.autor.nombre} ${p.autor.apellido}`;
  }

  get authorAvatar(): string {
    return this.post()?.autor?.imgUrl || '';
  }

  get currentUserAvatar(): string {
    return this.currentUser?.imgUrl || '';
  }

  goToFeed() {
    this.router.navigate(['/publicaciones']);
  }

  goToProfile() {
    this.router.navigate(['/mi-perfil']);
  }
}
