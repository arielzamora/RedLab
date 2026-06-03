import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = '';
  password = '';
  
  // Custom modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';

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
    if (!this.username || !this.password) {
      this.openModal('Campos requeridos', 'Por favor, ingresa tu correo/usuario y tu contraseña.');
      return;
    }

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        // Backend wrap responses in TransformInterceptor, standard Nest errors will have { message, error, statusCode }
        const errMsg = err.error?.data?.message || err.error?.message || 'Usuario o contraseña incorrectos. Por favor, intenta de nuevo.';
        this.openModal('Error de Inicio de Sesión', errMsg);
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/registro']);
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
