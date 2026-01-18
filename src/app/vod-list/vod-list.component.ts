import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';
import { XtreamCategory, XtreamVodStream } from '../types';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-vod-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './vod-list.component.html',
    styleUrl: './vod-list.component.css'
})
export class VodListComponent implements OnInit {
    private xtreamService = inject(XtreamService);
    private router = inject(Router);
    protected Math = Math;

    categories: XtreamCategory[] = [];
    streams: XtreamVodStream[] = [];
    filteredStreams: XtreamVodStream[] = [];
    loading = false;
    selectedCategoryId: string = '';

    searchTerm: string = '';
    searchSubject = new Subject<string>();
    currentPage = 1;
    pageSize = 20;

    ngOnInit() {
        if (!this.xtreamService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }

        this.fetchCategories();

        this.searchSubject.pipe(
            debounceTime(1000),
            distinctUntilChanged()
        ).subscribe(() => {
            this.applyFilter();
        });
    }

    fetchCategories() {
        this.loading = true;
        this.xtreamService.getVodCategories().subscribe({
            next: (cats) => {
                this.categories = cats;
                this.loading = false;
                // Optionally select first category or fetch all (if api supports it without cat id, usually yes)
                // But for VOD, often too many. Let's wait for user to select or select first.
                // Or just try fetching with empty category (all) if not too heavy.
                // Let's force user to select or load 'All' if default.
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    onCategoryChange() {
        this.currentPage = 1;
        this.searchTerm = '';
        if (!this.selectedCategoryId) {
            this.streams = [];
            this.filteredStreams = [];
            return;
        }
        this.fetchStreams();
    }

    onSearch() {
        this.currentPage = 1;
        this.searchSubject.next(this.searchTerm);
    }

    applyFilter() {
        if (!this.searchTerm.trim()) {
            this.filteredStreams = this.streams;
        } else {
            const term = this.searchTerm.toLowerCase().trim();
            this.filteredStreams = this.streams.filter(s =>
                s.name.toLowerCase().includes(term)
            );
        }
        this.currentPage = 1;
    }

    fetchStreams() {
        this.loading = true;
        this.xtreamService.getVodStreams(this.selectedCategoryId).subscribe({
            next: (streams) => {
                this.streams = streams;
                this.applyFilter();
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    get totalPages(): number {
        return Math.ceil(this.filteredStreams.length / this.pageSize);
    }

    get paginatedStreams(): XtreamVodStream[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredStreams.slice(start, start + this.pageSize);
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
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    playStream(stream: XtreamVodStream) {
        this.router.navigate(['/movie', stream.stream_id]);
    }

    backToDashboard() {
        this.router.navigate(['/dashboard']);
    }
}
