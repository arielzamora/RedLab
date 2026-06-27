import { Directive, ElementRef, OnInit } from '@angular/core';
import { Auth } from '../services/auth';

@Directive({
  selector: '[appAdminOnly]',
  standalone: true,
})
export class AdminOnlyDirective implements OnInit {
  constructor(
    private readonly el: ElementRef,
    private readonly auth: Auth
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user || user.perfil !== 'administrador') {
      this.el.nativeElement.style.display = 'none';
    }
  }
}
