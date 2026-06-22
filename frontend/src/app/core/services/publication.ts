import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Publication {
  private apiUrl = `${environment.apiUrl}/publications`;

  constructor(private http: HttpClient) { }

  getPublications(limit: number = 10, offset: number = 0, sortBy: string = 'fecha', autor?: string) {
    let url = `${this.apiUrl}?limit=${limit}&offset=${offset}&sortBy=${sortBy}`;
    if (autor) {
      url += `&autor=${autor}`;
    }
    return this.http.get(url);
  }

  getPublicationById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPublication(data: FormData | any) {
    return this.http.post(this.apiUrl, data);
  }

  deletePublication(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  likePublication(id: string) {
    return this.http.post(`${this.apiUrl}/${id}/like`, {});
  }

  unlikePublication(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/like`);
  }

  addComment(id: string, texto: string) {
    return this.http.post(`${this.apiUrl}/${id}/comments`, { texto });
  }

  getComments(id: string, limit: number = 5, offset: number = 0) {
    return this.http.get(`${this.apiUrl}/${id}/comments?limit=${limit}&offset=${offset}`);
  }

  editComment(id: string, commentId: string, texto: string) {
    return this.http.put(`${this.apiUrl}/${id}/comments/${commentId}`, { texto });
  }
}
