import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarFallback',
  standalone: true,
})
export class AvatarFallbackPipe implements PipeTransform {
  transform(imgUrl: string | undefined | null, name: string = 'User'): string {
    if (imgUrl && imgUrl.trim()) {
      return imgUrl;
    }
    const cleanName = encodeURIComponent(name.trim());
    return `https://ui-avatars.com/api/?name=${cleanName}&background=1877f2&color=fff&size=128`;
  }
}
