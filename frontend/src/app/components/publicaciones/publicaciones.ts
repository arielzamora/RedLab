import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostCard } from '../post-card/post-card';
import { Auth } from '../../core/services/auth';
import { Publication } from '../../core/services/publication';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCard],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
})
export class Publicaciones implements OnInit {
  posts: any[] = [];
  nuevoTexto = '';
  currentUser: any = null;
  isLoading = false;

  constructor(
    private readonly auth: Auth,
    private readonly publicationService: Publication,
    private readonly router: Router,
  ) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.currentUser = this.auth.getCurrentUser();
    }
  }

  ngOnInit() {
    if (this.currentUser) {
      this.loadPosts();
    }
  }

  loadPosts() {
    this.isLoading = true;
    this.publicationService.getPublications(20, 0).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        // Backend wraps responses inside { data, statusCode } using TransformInterceptor
        this.posts = response.data || response;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  crearPost() {
    if (!this.nuevoTexto.trim()) return;

    const data = {
      texto: this.nuevoTexto
    };

    this.publicationService.createPublication(data).subscribe({
      next: (response: any) => {
        const newPost = response.data || response;
        this.posts.unshift(newPost); // Add new post to top of list
        this.nuevoTexto = '';
      },
      error: (err) => {
        console.error('Error al crear publicación:', err);
      }
    });
  }

  onLikeToggled(post: any) {
    const isLiked = post.likes.includes(this.currentUser.id);
    if (isLiked) {
      this.publicationService.unlikePublication(post._id).subscribe({
        next: (response: any) => {
          const updated = response.data || response;
          this.updatePostInList(updated);
        }
      });
    } else {
      this.publicationService.likePublication(post._id).subscribe({
        next: (response: any) => {
          const updated = response.data || response;
          this.updatePostInList(updated);
        }
      });
    }
  }

  onDeleteRequested(post: any) {
    this.publicationService.deletePublication(post._id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p._id !== post._id);
      },
      error: (err) => {
        console.error('Error al eliminar publicación:', err);
      }
    });
  }

  updatePostInList(updatedPost: any) {
    this.posts = this.posts.map(p => p._id === updatedPost._id ? updatedPost : p);
  }

  goToProfile() {
    this.router.navigate(['/mi-perfil']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
