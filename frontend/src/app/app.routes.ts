import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Publicaciones } from './components/publicaciones/publicaciones';
import { MiPerfil } from './components/mi-perfil/mi-perfil';
import { PublicacionDetalle } from './components/publicacion-detalle/publicacion-detalle';
import { DashboardUsuarios } from './components/dashboard-usuarios/dashboard-usuarios';
import { DashboardEstadisticas } from './components/dashboard-estadisticas/dashboard-estadisticas';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'publicaciones', component: Publicaciones },
  { path: 'publicaciones/:id', component: PublicacionDetalle },
  { path: 'mi-perfil', component: MiPerfil },
  { path: 'dashboard/usuarios', component: DashboardUsuarios },
  { path: 'dashboard/estadisticas', component: DashboardEstadisticas },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
