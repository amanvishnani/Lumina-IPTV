import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';
import { XtreamCategory, XtreamVodStream } from '../types';
import { FormsModule } from '@angular/forms';

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

    categories: XtreamCategory[] = [];
    streams: XtreamVodStream[] = [];
    filteredStreams: XtreamVodStream[] = [];
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
        if (!this.selectedCategoryId) {
            this.streams = [];
            this.filteredStreams = [];
            return;
        }
        this.fetchStreams();
    }

    fetchStreams() {
        this.loading = true;
        this.xtreamService.getVodStreams(this.selectedCategoryId).subscribe({
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

    playStream(stream: XtreamVodStream) {
        // For VOD, type is usually 'movie'
        this.router.navigate(['/play', stream.stream_id, 'movie', stream.container_extension]);
    }

    backToDashboard() {
        this.router.navigate(['/dashboard']);
    }
}
