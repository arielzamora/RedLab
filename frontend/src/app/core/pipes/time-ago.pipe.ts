import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) return 'Hace instantes'; // Protection against minor clock offsets
    if (seconds < 60) return 'Hace instantes';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Ayer';
    if (days < 30) return `Hace ${days} días`;
    
    // Fallback to local date string
    return date.toLocaleDateString();
  }
}
