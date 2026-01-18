import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';
import { XtreamCategory, XtreamSeries } from '../types';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-series-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './series-list.component.html',
    styleUrl: './series-list.component.css'
})
export class SeriesListComponent implements OnInit {
    private xtreamService = inject(XtreamService);
    private router = inject(Router);
    protected Math = Math;

    categories: XtreamCategory[] = [];
    series: XtreamSeries[] = [];
    filteredSeries: XtreamSeries[] = [];
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
        this.xtreamService.getSeriesCategories().subscribe({
            next: (cats) => {
                this.categories = cats;
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
        this.searchTerm = '';
        if (!this.selectedCategoryId) {
            this.series = [];
            this.filteredSeries = [];
            return;
        }
        this.fetchSeries();
    }

    onSearch() {
        this.currentPage = 1;
        this.searchSubject.next(this.searchTerm);
    }

    applyFilter() {
        if (!this.searchTerm.trim()) {
            this.filteredSeries = this.series;
        } else {
            const term = this.searchTerm.toLowerCase().trim();
            this.filteredSeries = this.series.filter(s =>
                s.name.toLowerCase().includes(term)
            );
        }
        this.currentPage = 1;
    }

    fetchSeries() {
        this.loading = true;
        this.xtreamService.getSeries(this.selectedCategoryId).subscribe({
            next: (series) => {
                this.series = series;
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
        return Math.ceil(this.filteredSeries.length / this.pageSize);
    }

    get paginatedSeries(): XtreamSeries[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredSeries.slice(start, start + this.pageSize);
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

    openSeries(s: XtreamSeries) {
        this.router.navigate(['/series', s.series_id]);
    }

    backToDashboard() {
        this.router.navigate(['/dashboard']);
    }
}
