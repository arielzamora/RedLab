import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appPreventCopyPaste]',
  standalone: true,
})
export class PreventCopyPasteDirective {
  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent) {
    event.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
  }

  @HostListener('cut', ['$event'])
  onCut(event: ClipboardEvent) {
    event.preventDefault();
  }
}
