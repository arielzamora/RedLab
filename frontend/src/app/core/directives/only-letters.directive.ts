import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyLetters]',
  standalone: true,
})
export class OnlyLettersDirective {
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const char = event.key;
    // Permitir letras (con acentos, diéresis, ñ) y espacios
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    if (!regex.test(char)) {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const originalValue = input.value;
    // Limpiar cualquier carácter que no sea letra o espacio (ej: pegado de texto)
    const cleanedValue = originalValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    if (originalValue !== cleanedValue) {
      input.value = cleanedValue;
      // Disparar evento para que Angular Reactive Forms detecte el cambio de valor
      input.dispatchEvent(new Event('input'));
    }
  }
}
