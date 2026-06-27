import { Component, OnInit, ChangeDetectorRef, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { Publication } from '../../core/services/publication';
import { AvatarFallbackPipe } from '../../core/pipes/avatar-fallback.pipe';

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarFallbackPipe],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.scss',
})
export class DashboardEstadisticas implements OnInit {
  currentUser: any = null;
  
  // Date range filters
  fechaInicio = '';
  fechaFin = '';

  // Stats raw data
  publicacionesPorUsuario = signal<any[]>([]);
  comentariosTotales = signal<any[]>([]);
  comentariosPorPublicacion = signal<any[]>([]);
  
  isLoading = signal(false);

  constructor(
    private readonly auth: Auth,
    private readonly publicationService: Publication,
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

    // Set default date range: last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.fechaInicio = this.formatDate(thirtyDaysAgo);
    this.fechaFin = this.formatDate(today);
  }

  ngOnInit() {
    if (this.currentUser && this.currentUser.perfil === 'administrador') {
      this.loadAllStats();
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadAllStats() {
    this.isLoading.set(true);
    this.cdr.markForCheck();

    // Fetch stats in parallel or sequential. Let's do sequential or forkJoin.
    this.publicationService.getPublicacionesPorUsuarioStats(this.fechaInicio, this.fechaFin).subscribe({
      next: (res1: any) => {
        this.publicacionesPorUsuario.set(res1.data || res1);
        
        this.publicationService.getComentariosTotalesStats(this.fechaInicio, this.fechaFin).subscribe({
          next: (res2: any) => {
            this.comentariosTotales.set(res2.data || res2);
            
            this.publicationService.getComentariosPorPublicacionStats(this.fechaInicio, this.fechaFin).subscribe({
              next: (res3: any) => {
                this.comentariosPorPublicacion.set(res3.data || res3);
                this.isLoading.set(false);
                this.cdr.markForCheck();
              },
              error: () => this.isLoading.set(false)
            });
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  onFilterChange() {
    this.loadAllStats();
  }

  // --- Helpers for SVG Charts ---

  // 1. Bar Chart (Publications per User)
  get maxPublications(): number {
    const list = this.publicacionesPorUsuario();
    if (list.length === 0) return 1;
    return Math.max(...list.map(u => u.count), 1);
  }

  // 2. Line Chart (Comments over time)
  // Maps commentsTotales data to coordinates on a 500x200 SVG viewBox
  get lineChartPath(): string {
    const list = this.comentariosTotales();
    if (list.length < 2) return '';
    
    const maxVal = Math.max(...list.map(item => item.count), 1);
    const width = 500;
    const height = 200;
    const padding = 25;
    
    const points = list.map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / (list.length - 1);
      // Invert Y axis for SVG (0,0 is top-left)
      const y = (height - padding) - (item.count * (height - padding * 2)) / maxVal;
      return { x, y };
    });

    // Generate SVG path string (M x y L x y ...)
    return points.reduce((path, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
    }, '');
  }

  get lineChartAreaPath(): string {
    const list = this.comentariosTotales();
    if (list.length < 2) return '';
    
    const maxVal = Math.max(...list.map(item => item.count), 1);
    const width = 500;
    const height = 200;
    const padding = 25;
    
    const points = list.map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / (list.length - 1);
      const y = (height - padding) - (item.count * (height - padding * 2)) / maxVal;
      return { x, y };
    });

    const startX = points[0].x;
    const endX = points[points.length - 1].x;
    const bottomY = height - padding;

    const linePath = points.reduce((path, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
    }, '');

    return `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  }

  get linePoints() {
    const list = this.comentariosTotales();
    if (list.length === 0) return [];
    
    const maxVal = Math.max(...list.map(item => item.count), 1);
    const width = 500;
    const height = 200;
    const padding = 25;
    
    return list.map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / (list.length - 1);
      const y = (height - padding) - (item.count * (height - padding * 2)) / maxVal;
      return { x, y, label: item.fecha, value: item.count };
    });
  }

  // 3. Donut/Pie Chart (Comments per Publication)
  // Computes the dasharray and dashoffset for the SVG circles
  get donutSlices() {
    const list = this.comentariosPorPublicacion();
    if (list.length === 0) return [];
    
    const totalComments = list.reduce((sum, p) => sum + p.count, 0);
    if (totalComments === 0) {
      // If there are no comments at all, render one full gray slice
      return [{
        title: 'Sin comentarios',
        count: 0,
        percentage: 100,
        dashArray: '100 0',
        dashOffset: 100,
        color: '#ced0d4'
      }];
    }

    // Curated color palette (harmonious HSL colors)
    const colors = [
      '#1877f2', // Facebook Blue
      '#42b72a', // Green
      '#f02849', // Red
      '#f7b924', // Yellow
      '#8a3ab9', // Purple
      '#e1306c', // Pink
      '#00bcd4', // Cyan
      '#ff5722', // Orange
    ];

    let accumulatedPercentage = 0;
    
    const slices = list.map((item, index) => {
      const percentage = Math.round((item.count / totalComments) * 100);
      const color = colors[index % colors.length];
      
      const slice = {
        title: item.titulo,
        count: item.count,
        percentage,
        dashArray: `${percentage} ${100 - percentage}`,
        // dashoffset represents where the slice starts. We deduct the accumulated percentage from 100.
        // SVG stroke-dashoffset starts from top when offset is 25 (90deg counter-clockwise).
        // Standard formula: dashOffset = 100 - accumulatedPercentage + 25 (modulo 100)
        dashOffset: 100 - accumulatedPercentage,
        color
      };
      
      accumulatedPercentage += percentage;
      return slice;
    });

    return slices;
  }

  get middleCommentDate(): string {
    const list = this.comentariosTotales();
    if (list.length === 0) return '';
    const midIndex = Math.floor(list.length / 2);
    return list[midIndex]?.fecha || '';
  }

  goToFeed() {
    this.router.navigate(['/publicaciones']);
  }

  goToUsers() {
    this.router.navigate(['/dashboard/usuarios']);
  }

  goToProfile() {
    this.router.navigate(['/mi-perfil']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
