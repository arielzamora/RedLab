import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { Publication } from '../../core/services/publication';
import { PostCard } from '../post-card/post-card';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCard],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit {
  currentUser = signal<any>(null);
  myPosts = signal<any[]>([]);

  // Form fields
  nombre = '';
  apellido = '';
  descripcion = '';
  fechaNacimiento = '';
  perfil = 'usuario';
  selectedFile: File | null = null;

  // Modal properties
  showModal = signal(false);
  modalTitle = signal('');
  modalMessage = signal('');
  isSuccess = signal(false);
  isLoading = signal(false);

  constructor(
    private readonly auth: Auth,
    private readonly publicationService: Publication,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.currentUser.set(this.auth.getCurrentUser());
    }
  }

  ngOnInit() {
    const user = this.currentUser();
    if (user) {
      this.nombre = user.nombre || '';
      this.apellido = user.apellido || '';
      this.descripcion = user.descripcion || '';
      this.perfil = user.perfil || 'usuario';

      if (user.fechaNacimiento) {
        // Format Date to YYYY-MM-DD for date input
        const date = new Date(user.fechaNacimiento);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        this.fechaNacimiento = `${year}-${month}-${day}`;
      }

      this.loadMyPosts();
      this.cdr.markForCheck();
    }
  }

  loadMyPosts() {
    const user = this.currentUser();
    if (!user) return;
    const userId = user.id || user._id;
    this.publicationService.getPublications(3, 0, 'fecha', userId).subscribe({
      next: (response: any) => {
        this.myPosts.set(response.data || response);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar mis publicaciones:', err);
        this.cdr.markForCheck();
      }
    });
  }

  onLikeToggled(post: any) {
    const user = this.currentUser();
    const userId = user ? (user.id || user._id) : '';
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      this.publicationService.unlikePublication(post._id).subscribe({
        next: (response: any) => {
          const updated = response.data || response;
          this.updateMyPostInList(updated);
          this.cdr.markForCheck();
        },
        error: () => this.cdr.markForCheck()
      });
    } else {
      this.publicationService.likePublication(post._id).subscribe({
        next: (response: any) => {
          const updated = response.data || response;
          this.updateMyPostInList(updated);
          this.cdr.markForCheck();
        },
        error: () => this.cdr.markForCheck()
      });
    }
  }

  onDeleteRequested(post: any) {
    this.publicationService.deletePublication(post._id).subscribe({
      next: () => {
        this.myPosts.update(prev => prev.filter(p => p._id !== post._id));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al eliminar publicación:', err);
        this.cdr.markForCheck();
      }
    });
  }

  updateMyPostInList(updatedPost: any) {
    this.myPosts.update(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (!this.nombre || !this.apellido) {
      this.openModal('Campos requeridos', 'El nombre y apellido son obligatorios.');
      return;
    }

    this.isLoading.set(true);
    this.cdr.markForCheck();

    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('apellido', this.apellido);
    formData.append('descripcion', this.descripcion);
    formData.append('perfil', this.perfil);
    if (this.fechaNacimiento) {
      formData.append('fechaNacimiento', this.fechaNacimiento);
    }
    if (this.selectedFile) {
      formData.append('imagenPerfil', this.selectedFile, this.selectedFile.name);
    }

    const user = this.currentUser();
    const userId = user ? (user.id || user._id) : '';

    this.auth.updateProfile(userId, formData).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const updatedUser = response.data || response;
        
        // Map backend returned user _id back to id (since frontend Auth helper looks for .id)
        const mappedUser = {
          id: updatedUser._id,
          nombre: updatedUser.nombre,
          apellido: updatedUser.apellido,
          correo: updatedUser.correo,
          username: updatedUser.username,
          imgUrl: updatedUser.imgUrl,
          perfil: updatedUser.perfil,
          descripcion: updatedUser.descripcion,
          fechaNacimiento: updatedUser.fechaNacimiento,
        };

        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(mappedUser));
        this.currentUser.set(mappedUser);
        
        this.openModal('Perfil Actualizado', 'Tu información se ha actualizado correctamente.', true);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading.set(false);
        const errMsg = err.error?.data?.message || err.error?.message || 'No se pudo actualizar el perfil. Intenta de nuevo.';
        this.openModal('Error de Actualización', errMsg, false);
        this.cdr.markForCheck();
      }
    });
  }

  goToFeed() {
    this.router.navigate(['/publicaciones']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  openModal(title: string, message: string, isSuccess: boolean = false) {
    this.modalTitle.set(title);
    this.modalMessage.set(message);
    this.isSuccess.set(isSuccess);
    this.showModal.set(true);
    this.cdr.markForCheck();
  }

  closeModal() {
    this.showModal.set(false);
    this.cdr.markForCheck();
    if (this.isSuccess()) {
      // Refresh component or navigate back to feed
      this.router.navigate(['/publicaciones']);
    }
  }
}
