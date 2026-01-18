import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';
import { XtreamVodInfo } from '../types';

@Component({
    selector: 'app-vod-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vod-details.component.html',
    styleUrl: './vod-details.component.css'
})
export class VodDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private location = inject(Location);
    private xtreamService = inject(XtreamService);

    movieInfo: XtreamVodInfo | null = null;
    loading = false;
    error = '';

    ngOnInit() {
        if (!this.xtreamService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.fetchMovieInfo(Number(id));
        } else {
            this.error = 'Invalid Movie ID';
        }
    }

    fetchMovieInfo(id: number) {
        this.loading = true;
        this.xtreamService.getVodInfo(id).subscribe({
            next: (info) => {
                this.movieInfo = info;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching movie info:', err);
                this.error = 'Failed to load movie details.';
                this.loading = false;
            }
        });
    }

    play() {
        if (this.movieInfo) {
            this.router.navigate(['/play', this.movieInfo.movie_data.stream_id, 'movie', this.movieInfo.movie_data.container_extension]);
        }
    }

    download() {
        if (this.movieInfo) {
            const creds = this.xtreamService.getCredentials();
            if (!creds) return;

            // Use container_extension if available, otherwise fallback to mp4
            const extension = this.movieInfo.movie_data.container_extension || 'mp4';

            // Construct the stream URL
            const streamUrl = `${this.formatUrl(creds.url)}/movie/${creds.username}/${creds.password}/${this.movieInfo.movie_data.stream_id}.${extension}`;

            // Opening in a new window/tab is often more reliable for media streams
            // that the server doesn't explicitly flag with a Content-Disposition header.
            window.open(streamUrl, '_blank');
        }
    }

    goBack() {
        this.location.back();
    }

    private formatUrl(url: string): string {
        let formatted = url;
        if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
            formatted = 'http://' + formatted;
        }
        if (formatted.endsWith('/')) {
            formatted = formatted.slice(0, -1);
        }
        return formatted;
    }
}
