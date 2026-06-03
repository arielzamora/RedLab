import { Component } from '@angular/core';
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
  fechaNacimiento = '';
  descripcion = '';

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
  ) {
    // If already logged in, redirect to feed
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/publicaciones']);
    }
  }

  onSubmit() {
    if (!this.nombre || !this.apellido || !this.correo || !this.username || !this.password) {
      this.openModal('Campos requeridos', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    this.isLoading = true;

    const payload = {
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo,
      username: this.username,
      password: this.password,
      fechaNacimiento: this.fechaNacimiento || undefined,
      descripcion: this.descripcion || undefined,
    };

    this.auth.registro(payload).subscribe({
      next: () => {
        // Auto-login the user immediately after successful registration
        this.auth.login({ username: this.username, password: this.password }).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/publicaciones']);
          },
          error: (loginErr) => {
            this.isLoading = false;
            // Fallback: if auto-login fails, redirect to login screen so they can try manually
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err.error?.data?.message || err.error?.message || 'Hubo un problema al crear tu cuenta. Por favor, intenta de nuevo.';
        this.openModal('Error de Registro', errMsg);
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
  }

  closeModal() {
    this.showModal = false;
  }
}
