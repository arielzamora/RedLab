import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit {
  currentUser: any = null;

  // Form fields
  nombre = '';
  apellido = '';
  descripcion = '';
  fechaNacimiento = '';
  perfil = 'usuario';
  selectedFile: File | null = null;

  // Modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  isSuccess = false;
  isLoading = false;

  constructor(
    private readonly auth: Auth,
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
      this.nombre = this.currentUser.nombre || '';
      this.apellido = this.currentUser.apellido || '';
      this.descripcion = this.currentUser.descripcion || '';
      this.perfil = this.currentUser.perfil || 'usuario';

      if (this.currentUser.fechaNacimiento) {
        // Format Date to YYYY-MM-DD for date input
        const date = new Date(this.currentUser.fechaNacimiento);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        this.fechaNacimiento = `${year}-${month}-${day}`;
      }
    }
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

    this.isLoading = true;

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

    this.auth.updateProfile(this.currentUser.id, formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
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
        this.currentUser = mappedUser;
        
        this.openModal('Perfil Actualizado', 'Tu información se ha actualizado correctamente.', true);
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err.error?.data?.message || err.error?.message || 'No se pudo actualizar el perfil. Intenta de nuevo.';
        this.openModal('Error de Actualización', errMsg, false);
      }
    });
  }

  goToFeed() {
    this.router.navigate(['/publicaciones']);
  }

  openModal(title: string, message: string, isSuccess: boolean = false) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.isSuccess = isSuccess;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    if (this.isSuccess) {
      // Refresh component or navigate back to feed
      this.router.navigate(['/publicaciones']);
    }
  }
}
