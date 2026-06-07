import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  nombre = '';
  apellido = '';
  correo = '';
  username = '';
  password = '';
  repetirPassword = '';
  fechaNacimiento = '';
  descripcion = '';
  perfil = 'usuario';
  selectedFile: File | null = null;

  // Custom modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  isSuccess = false;
  
  // Loading state
  isLoading = false;

  constructor(
    private readonly auth: Auth,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    // If already logged in, redirect to feed
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/publicaciones']);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (!this.nombre || !this.apellido || !this.correo || !this.username || !this.password || !this.repetirPassword) {
      this.openModal('Campos requeridos', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (this.password !== this.repetirPassword) {
      this.openModal('Validación de Contraseña', 'Las contraseñas no coinciden.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.openModal('Validación de Contraseña', 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.');
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('apellido', this.apellido);
    formData.append('correo', this.correo);
    formData.append('username', this.username);
    formData.append('password', this.password);
    formData.append('perfil', this.perfil);
    if (this.fechaNacimiento) {
      formData.append('fechaNacimiento', this.fechaNacimiento);
    }
    if (this.descripcion) {
      formData.append('descripcion', this.descripcion);
    }
    if (this.selectedFile) {
      formData.append('imagenPerfil', this.selectedFile, this.selectedFile.name);
    }

    this.auth.registro(formData).subscribe({
      next: () => {
        // Auto-login the user immediately after successful registration
        this.auth.login({ username: this.username, password: this.password }).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/publicaciones']);
            this.cdr.markForCheck();
          },
          error: (loginErr) => {
            this.isLoading = false;
            this.router.navigate(['/login']);
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err.error?.data?.message || err.error?.message || 'Hubo un problema al crear tu cuenta. Por favor, intenta de nuevo.';
        this.openModal('Error de Registro', errMsg);
        this.cdr.markForCheck();
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.markForCheck();
  }
}
