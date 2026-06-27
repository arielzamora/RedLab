import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective {
  @Input() appImgFallback: string = '';

  constructor(private readonly el: ElementRef) {}

  @HostListener('error')
  onError() {
    const element = this.el.nativeElement as HTMLImageElement;
    element.src = this.appImgFallback || 'https://ui-avatars.com/api/?name=Image+Error&background=e4e6eb&color=65676b&size=150';
  }
}
