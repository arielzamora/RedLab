import { Component } from '@angular/core';
import { PostCard } from '../post-card/post-card';

@Component({
  selector: 'app-publicaciones',
  imports: [PostCard],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
})
export class Publicaciones {}
