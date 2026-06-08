import { Component, ChangeDetectorRef } from '@angular/core';
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
  isLoading = false;
  
  // Custom modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';

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

  onSubmit() {
    if (!this.username || !this.password) {
      this.openModal('Campos requeridos', 'Por favor, ingresa tu correo/usuario y tu contraseña.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.openModal('Validación de Contraseña', 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.');
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/publicaciones']);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err.error?.data?.message || err.error?.message || 'Usuario o contraseña incorrectos. Por favor, intenta de nuevo.';
        this.openModal('Error de Inicio de Sesión', errMsg);
        this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.markForCheck();
  }
}
