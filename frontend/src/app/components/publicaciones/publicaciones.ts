import { Component, OnInit, signal } from '@angular/core';
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
  posts = signal<any[]>([]);
  isLoading = signal(false);
  
  // Post Creation
  nuevoTitulo = '';
  nuevaDescripcion = '';
  imagenSeleccionada: File | null = null;
  
  // Pagination & Sorting
  limit = 5;
  offset = 0;
  sortBy = 'fecha';
  
  currentUser: any = null;

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
    this.isLoading.set(true);
    this.publicationService.getPublications(this.limit, this.offset, this.sortBy).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        this.posts.set(response.data || response);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
    }
  }

  resetFileInput() {
    this.imagenSeleccionada = null;
    const fileInput = document.getElementById('imagenPost') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  crearPost() {
    if (!this.nuevoTitulo.trim() || !this.nuevaDescripcion.trim()) return;

    const formData = new FormData();
    formData.append('titulo', this.nuevoTitulo.trim());
    formData.append('descripcion', this.nuevaDescripcion.trim());
    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada, this.imagenSeleccionada.name);
    }

    this.publicationService.createPublication(formData).subscribe({
      next: (response: any) => {
        const newPost = response.data || response;
        if (this.sortBy === 'fecha' && this.offset === 0) {
          this.posts.update(prev => {
            const updatedList = [newPost, ...prev];
            if (updatedList.length > this.limit) {
              updatedList.pop();
            }
            return updatedList;
          });
        } else {
          this.loadPosts();
        }
        this.nuevoTitulo = '';
        this.nuevaDescripcion = '';
        this.imagenSeleccionada = null;
        const fileInput = document.getElementById('imagenPost') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => {
        console.error('Error al crear publicación:', err);
      }
    });
  }

  changeSort(mode: string) {
    if (this.sortBy !== mode) {
      this.sortBy = mode;
      this.offset = 0;
      this.loadPosts();
    }
  }

  nextPage() {
    if (this.hasNextPage) {
      this.offset += this.limit;
      this.loadPosts();
    }
  }

  prevPage() {
    if (this.hasPrevPage) {
      this.offset -= this.limit;
      this.loadPosts();
    }
  }

  get hasNextPage(): boolean {
    return this.posts().length === this.limit;
  }

  get hasPrevPage(): boolean {
    return this.offset > 0;
  }

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  onLikeToggled(post: any) {
    const userId = this.currentUser.id || this.currentUser._id;
    const isLiked = post.likes.includes(userId);
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
        this.posts.update(prev => prev.filter(p => p._id !== post._id));
      },
      error: (err) => {
        console.error('Error al eliminar publicación:', err);
      }
    });
  }

  updatePostInList(updatedPost: any) {
    this.posts.update(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  }

  goToProfile() {
    this.router.navigate(['/mi-perfil']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
