import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';
import { XtreamSeriesInfo, XtreamEpisode } from '../types';

@Component({
    selector: 'app-series-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './series-details.component.html',
    styleUrl: './series-details.component.css'
})
export class SeriesDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private xtreamService = inject(XtreamService);

    seriesInfo: XtreamSeriesInfo | null = null;
    seasons: string[] = [];
    selectedSeason: string = '';
    episodes: XtreamEpisode[] = [];
    loading = false;

    ngOnInit() {
        if (!this.xtreamService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }

        const seriesId = this.route.snapshot.paramMap.get('id');
        if (seriesId) {
            this.fetchSeriesInfo(parseInt(seriesId));
        }
    }

    fetchSeriesInfo(seriesId: number) {
        this.loading = true;
        this.xtreamService.getSeriesInfo(seriesId).subscribe({
            next: (info) => {
                this.seriesInfo = info;
                // Season numbers are keys in episodes object
                if (info.episodes) {
                    this.seasons = Object.keys(info.episodes);
                    if (this.seasons.length > 0) {
                        this.selectSeason(this.seasons[0]);
                    }
                }
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    selectSeason(season: string) {
        this.selectedSeason = season;
        if (this.seriesInfo && this.seriesInfo.episodes) {
            this.episodes = this.seriesInfo.episodes[season];
        }
    }

    playEpisode(episode: XtreamEpisode) {
        // Episode ID is usually the stream_id for playback
        // Container extension format: 'mp4', 'mkv', etc.
        const ext = episode.container_extension;
        this.router.navigate(['/play', episode.id, 'series', ext]);
    }

    backToSeries() {
        this.router.navigate(['/series']);
    }
}
