import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  
  // Custom modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: Auth,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    // If already logged in, redirect to feed
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/publicaciones']);
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.openModal('Campos inválidos', 'Por favor, revisa que los datos ingresados cumplan con el formato correcto.');
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const credentials = this.loginForm.value;

    this.auth.login(credentials).subscribe({
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

  quickLogin(role: 'admin' | 'invitado') {
    if (role === 'admin') {
      this.loginForm.setValue({
        username: 'arielzamoradzur@gmail.com',
        password: '1978ArielZ'
      });
    } else {
      this.loginForm.setValue({
        username: 'invitado',
        password: '1978ArielZ'
      });
    }
    this.cdr.markForCheck();
    this.onSubmit();
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
