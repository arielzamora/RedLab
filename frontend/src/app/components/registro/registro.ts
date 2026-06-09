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

    // Nombre validation
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/;
    if (!nameRegex.test(this.nombre.trim())) {
      this.openModal('Validación de Nombre', 'El nombre debe tener al menos 2 caracteres y contener únicamente letras y espacios.');
      return;
    }

    // Apellido validation
    if (!nameRegex.test(this.apellido.trim())) {
      this.openModal('Validación de Apellido', 'El apellido debe tener al menos 2 caracteres y contener únicamente letras y espacios.');
      return;
    }

    // Correo validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.correo.trim())) {
      this.openModal('Validación de Correo', 'Por favor, ingresa una dirección de correo electrónico válida (ejemplo@dominio.com).');
      return;
    }

    // Nombre de usuario validation
    const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
    if (!usernameRegex.test(this.username.trim())) {
      this.openModal('Validación de Usuario', 'El nombre de usuario debe tener entre 3 y 20 caracteres y contener únicamente letras, números, puntos, guiones o guiones bajos (sin espacios).');
      return;
    }

    // Fecha de nacimiento validation
    if (this.fechaNacimiento) {
      const birthdate = new Date(this.fechaNacimiento);
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
