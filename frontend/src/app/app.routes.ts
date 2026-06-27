import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Publicaciones } from './components/publicaciones/publicaciones';
import { MiPerfil } from './components/mi-perfil/mi-perfil';
import { PublicacionDetalle } from './components/publicacion-detalle/publicacion-detalle';
import { DashboardUsuarios } from './components/dashboard-usuarios/dashboard-usuarios';
import { DashboardEstadisticas } from './components/dashboard-estadisticas/dashboard-estadisticas';

export const routes: Routes = [
  { path: 'login', component: Login, data: { animation: 1 } },
  { path: 'registro', component: Registro, data: { animation: 2 } },
  { path: 'publicaciones', component: Publicaciones, data: { animation: 3 } },
  { path: 'publicaciones/:id', component: PublicacionDetalle, data: { animation: 4 } },
  { path: 'mi-perfil', component: MiPerfil, data: { animation: 5 } },
  { path: 'dashboard/usuarios', component: DashboardUsuarios, data: { animation: 6 } },
  { path: 'dashboard/estadisticas', component: DashboardEstadisticas, data: { animation: 7 } },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
