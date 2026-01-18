import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';
import { XtreamCategory, XtreamStream } from '../types';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

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

  // Search
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  // Pagination
  currentPage: number = 1;
  pageSize: number = 20;

  ngOnInit() {
    if (!this.xtreamService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.fetchData();

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilter();
    });
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
    this.currentPage = 1;
    this.fetchStreams();
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredStreams = this.streams;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStreams = this.streams.filter(s =>
        s.name.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStreams.length / this.pageSize);
  }

  get paginatedStreams(): XtreamStream[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredStreams.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
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
