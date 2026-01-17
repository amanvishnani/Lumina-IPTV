import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';
import { XtreamCategory, XtreamStream } from '../types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private xtreamService = inject(XtreamService);
  private router = inject(Router);

  categories: XtreamCategory[] = [];
  streams: XtreamStream[] = [];
  filteredStreams: XtreamStream[] = [];
  loading = false;
  selectedCategoryId: string = '';

  ngOnInit() {
    if (!this.xtreamService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    // content fetching
    this.xtreamService.getLiveCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        // Fetch all streams initially or just wait?
        // Let's fetch all streams default
        this.fetchStreams();
      },
      error: (err) => console.error(err)
    });
  }

  fetchStreams() {
    this.loading = true;
    this.xtreamService.getLiveStreams(this.selectedCategoryId).subscribe({
      next: (streams) => {
        this.streams = streams;
        this.filteredStreams = streams;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }



  onCategoryChange() {
    this.fetchStreams();
  }

  playStream(stream: XtreamStream) {
    this.router.navigate(['/play', stream.stream_id, stream.stream_type]);
  }

  goToMovies() {
    this.router.navigate(['/movies']);
  }

  goToSeries() {
    this.router.navigate(['/series']);
  }

  logout() {
    this.xtreamService.logout();
    this.router.navigate(['/login']);
  }
}
