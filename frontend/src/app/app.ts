import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterOutlet, Router, ChildrenOutletContexts } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from './core/services/auth';
import { Subscription } from 'rxjs';
import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const slideInAnimation =
  trigger('routeAnimations', [
    // Avanzar (:increment) -> la nueva página entra desde la derecha (100%) y la vieja sale hacia la izquierda (-100%)
    transition(':increment', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 2
        })
      ], { optional: true }),
      query(':enter', [
        style({ left: '100%', opacity: 0 })
      ], { optional: true }),
      group([
        query(':leave', [
          animate('450ms ease-out', style({ left: '-100%', opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          animate('450ms ease-out', style({ left: '0%', opacity: 1 }))
        ], { optional: true })
      ])
    ]),
    // Retroceder (:decrement) -> la nueva página entra desde la izquierda (-100%) y la vieja sale hacia la derecha (100%)
    transition(':decrement', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 2
        })
      ], { optional: true }),
      query(':enter', [
        style({ left: '-100%', opacity: 0 })
      ], { optional: true }),
      group([
        query(':leave', [
          animate('450ms ease-out', style({ left: '100%', opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          animate('450ms ease-out', style({ left: '0%', opacity: 1 }))
        ], { optional: true })
      ])
    ])
  ]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [slideInAnimation]
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('frontend');
  isLoading = signal(true);
  showSessionModal = signal(false);
  
  private sessionSubscription!: Subscription;
  private sessionWarningTimeout: any;
  private autoLogoutTimeout: any;

  constructor(
    private readonly auth: Auth,
    private readonly router: Router,
    private readonly contexts: ChildrenOutletContexts
  ) {}

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  ngOnInit() {
    // Check if there is a token to authorize
    const token = this.auth.getToken();
    if (token) {
      this.auth.autorizar().subscribe({
        next: () => {
          this.isLoading.set(false);
          // Redirect to publications if logged in and not already on a specific route
          const currentUrl = this.router.url;
          if (currentUrl === '/' || currentUrl === '/login' || currentUrl === '/registro') {
            this.router.navigate(['/publicaciones']);
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.isLoading.set(false);
      // Wait a tick to let current routing complete
      setTimeout(() => {
        const currentUrl = this.router.url;
        if (currentUrl === '/' || currentUrl === '/publicaciones' || currentUrl === '/mi-perfil') {
          this.router.navigate(['/login']);
        }
      }, 50);
    }

    // Listen for session starts (login, authorize, refresh)
    this.sessionSubscription = this.auth.sessionStarted.subscribe(() => {
      this.startSessionTimer();
    });

    // If already logged in, start the timer immediately (e.g. page refresh)
    if (this.auth.isLoggedIn()) {
      this.startSessionTimer();
    }
  }

  ngOnDestroy() {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
    this.clearTimers();
  }

  private startSessionTimer() {
    this.clearTimers();
    // 10 minutes warning: 10 * 60 * 1000 = 600,000 ms
    this.sessionWarningTimeout = setTimeout(() => {
      this.showSessionModal.set(true);
      // 5 minutes auto-logout: 5 * 60 * 1000 = 300,000 ms
      this.autoLogoutTimeout = setTimeout(() => {
        this.logoutDueToInactivity();
      }, 5 * 60 * 1000);
    }, 10 * 60 * 1000);
  }

  private clearTimers() {
    if (this.sessionWarningTimeout) {
      clearTimeout(this.sessionWarningTimeout);
    }
    if (this.autoLogoutTimeout) {
      clearTimeout(this.autoLogoutTimeout);
    }
  }

  extendSession() {
    this.showSessionModal.set(false);
    if (this.autoLogoutTimeout) {
      clearTimeout(this.autoLogoutTimeout);
    }
    this.auth.refrescar().subscribe({
      next: () => {
        // Resets timer automatically via sessionStarted subscription
      },
      error: () => {
        this.logoutDueToInactivity();
      }
    });
  }

  logoutDueToInactivity() {
    this.showSessionModal.set(false);
    this.clearTimers();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
