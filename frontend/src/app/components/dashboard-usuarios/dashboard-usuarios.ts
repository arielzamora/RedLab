import { Component, OnInit, ChangeDetectorRef, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { AvatarFallbackPipe } from '../../core/pipes/avatar-fallback.pipe';
import { PreventCopyPasteDirective } from '../../core/directives/prevent-copy-paste.directive';
import { OnlyLettersDirective } from '../../core/directives/only-letters.directive';
import { TruncatePipe } from '../../core/pipes/truncate.pipe';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AvatarFallbackPipe, PreventCopyPasteDirective, TruncatePipe, OnlyLettersDirective],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.scss',
})
export class DashboardUsuarios implements OnInit {
  users = signal<any[]>([]);
  searchQuery = signal('');
  showCreateForm = signal(false);
  isLoading = signal(false);
  isSubmitting = signal(false);
  currentUser: any = null;

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter(u =>
      (u.nombre || '').toLowerCase().includes(query) ||
      (u.apellido || '').toLowerCase().includes(query) ||
      (u.correo || '').toLowerCase().includes(query) ||
      (u.username || '').toLowerCase().includes(query)
    );
  });

  registerForm: FormGroup;
  selectedFile: File | null = null;

  // Custom modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  isSuccess = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: Auth,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.currentUser = this.auth.getCurrentUser();
      if (this.currentUser?.perfil !== 'administrador') {
        this.router.navigate(['/publicaciones']);
      }
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
      perfil: ['usuario', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    if (this.currentUser && this.currentUser.perfil === 'administrador') {
      this.loadUsers();
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const repetirPassword = g.get('repetirPassword')?.value;
    return password === repetirPassword ? null : { mismatch: true };
  }

  loadUsers() {
    this.isLoading.set(true);
    this.auth.getUsers().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        this.users.set(response.data || response);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  crearUsuario() {
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
        this.openModal('Restricción de Edad', 'El usuario debe ser mayor de 13 años.');
        return;
      }
    }

    this.isSubmitting.set(true);
    
    // Check if there is an image, since this endpoint might accept JSON or FormData.
    // For simplicity, we can send it as JSON if no file is selected, or FormData if there is a file.
    // Wait, the backend /users endpoint created in UsersController is:
    // @Post()
    // create(@Body() createUserDto: any)
    // So it accepts JSON body! It doesn't have FileInterceptor. So we can send JSON directly!
    const payload = {
      nombre,
      apellido,
      correo,
      username,
      password,
      perfil,
      fechaNacimiento: fechaNacimiento || undefined,
      descripcion: descripcion || undefined,
      activo: true
    };

    this.auth.crearUsuarioPorAdmin(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.openModal('Usuario Creado', `El usuario ${nombre} ${apellido} ha sido creado con éxito.`, true);
        this.registerForm.reset({ perfil: 'usuario' });
        this.selectedFile = null;
        const fileInput = document.getElementById('imagenPerfilAdmin') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        this.loadUsers();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errMsg = err.error?.data?.message || err.error?.message || 'Hubo un problema al crear el usuario.';
        this.openModal('Error al crear usuario', errMsg);
      }
    });
  }

  toggleUserStatus(user: any) {
    const isCurrentActive = user.activo;
    
    // Prevent deactivating oneself
    const currentUserId = this.currentUser.id || this.currentUser._id;
    if (user._id === currentUserId) {
      this.openModal('Acción Denegada', 'No puedes deshabilitar tu propia cuenta de administrador.');
      return;
    }

    if (isCurrentActive) {
      this.auth.deshabilitarUsuario(user._id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error al deshabilitar usuario:', err);
          this.openModal('Error', 'No se pudo deshabilitar el usuario.');
        }
      });
    } else {
      this.auth.habilitarUsuario(user._id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error al habilitar usuario:', err);
          this.openModal('Error', 'No se pudo habilitar el usuario.');
        }
      });
    }
  }

  toggleCreateForm() {
    this.showCreateForm.update(v => !v);
    this.cdr.markForCheck();
  }

  goToFeed() {
    this.router.navigate(['/publicaciones']);
  }

  goToStats() {
    this.router.navigate(['/dashboard/estadisticas']);
  }

  goToProfile() {
    this.router.navigate(['/mi-perfil']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  openModal(title: string, message: string, success = false) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
    this.isSuccess = success;
    this.cdr.markForCheck();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.markForCheck();
  }
}
