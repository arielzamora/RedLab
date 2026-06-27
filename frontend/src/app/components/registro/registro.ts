import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { OnlyLettersDirective } from '../../core/directives/only-letters.directive';
import { PreventCopyPasteDirective } from '../../core/directives/prevent-copy-paste.directive';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, OnlyLettersDirective, PreventCopyPasteDirective],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  registerForm: FormGroup;
  selectedFile: File | null = null;

  // Custom modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  isSuccess = false;
  
  // Loading state
  isLoading = false;

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

    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/)]],
      correo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{3,20}$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: [''],
      descripcion: [''],
      perfil: ['usuario']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const repetirPassword = g.get('repetirPassword')?.value;
    return password === repetirPassword ? null : { mismatch: true };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      
      if (this.registerForm.hasError('mismatch')) {
        this.openModal('Validación de Contraseña', 'Las contraseñas no coinciden.');
      } else {
        this.openModal('Campos inválidos', 'Por favor, revisa que los datos ingresados cumplan con el formato correcto.');
      }
      return;
    }

    const { nombre, apellido, correo, username, password, perfil, fechaNacimiento, descripcion } = this.registerForm.value;

    // Additional birthdate check
    if (fechaNacimiento) {
      const birthdate = new Date(fechaNacimiento);
      const today = new Date();
      
      if (birthdate > today) {
        this.openModal('Fecha de Nacimiento', 'La fecha de nacimiento no puede ser en el futuro.');
        return;
      }
      
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - 13);
      if (birthdate > minAgeDate) {
        this.openModal('Restricción de Edad', 'Debes ser mayor de 13 años para registrarte en utnLab.');
        return;
      }
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('correo', correo);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('perfil', perfil);
    if (fechaNacimiento) {
      formData.append('fechaNacimiento', fechaNacimiento);
    }
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }
    if (this.selectedFile) {
      formData.append('imagenPerfil', this.selectedFile, this.selectedFile.name);
    }

    this.auth.registro(formData).subscribe({
      next: () => {
        // Auto-login the user immediately after successful registration
        this.auth.login({ username: username, password: password }).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/publicaciones']);
            this.cdr.markForCheck();
          },
          error: () => {
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
