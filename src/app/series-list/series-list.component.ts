import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';
import { XtreamCategory, XtreamSeries } from '../types';
import { FormsModule } from '@angular/forms';

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

    categories: XtreamCategory[] = [];
    series: XtreamSeries[] = [];
    filteredSeries: XtreamSeries[] = [];
    loading = false;
    selectedCategoryId: string = '';

    ngOnInit() {
        if (!this.xtreamService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }

        this.fetchCategories();
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
        if (!this.selectedCategoryId) {
            this.series = [];
            this.filteredSeries = [];
            return;
        }
        this.fetchSeries();
    }

    fetchSeries() {
        this.loading = true;
        this.xtreamService.getSeries(this.selectedCategoryId).subscribe({
            next: (series) => {
                this.series = series;
                this.filteredSeries = series;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    openSeries(s: XtreamSeries) {
        this.router.navigate(['/series', s.series_id]);
    }

    backToDashboard() {
        this.router.navigate(['/dashboard']);
    }
}
