import { Component, ElementRef, OnInit, ViewChild, OnDestroy, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { XtreamService } from '../services/xtream.service';
import videojs from 'video.js';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css',
  encapsulation: ViewEncapsulation.None // Needed for video.js styles
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private xtreamService = inject(XtreamService);

  private player: any;
  error = '';
  streamUrl = '';

  ngOnInit() {
    if (!this.xtreamService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const streamId = this.route.snapshot.paramMap.get('streamId');
    const streamType = this.route.snapshot.paramMap.get('streamType');

    if (streamId && streamType) {
      this.initPlayer(streamId, streamType);
    } else {
      this.error = 'Invalid stream parameters';
    }
  }

  initPlayer(streamId: string, streamType: string) {
    const creds = this.xtreamService.getCredentials();
    if (!creds) return;

    // Construct stream URL
    const type = 'live';
    this.streamUrl = `${this.formatUrl(creds.url)}/${type}/${creds.username}/${creds.password}/${streamId}.m3u8`;

    console.log('Stream URL:', this.streamUrl);

    // Initialize Video.js
    this.player = videojs(this.videoElement.nativeElement, {
      controls: true,
      autoplay: true,
      preload: 'auto',
      fluid: true,
      sources: [{
        src: this.streamUrl,
        type: 'application/x-mpegURL'
      }],
      html5: {
        vhs: {
          overrideNative: true, // Use VHS even if native HLS is supported (for better control/consistency)
          limitRenditionByPlayerDimensions: true,
          useDevicePixelRatio: true
        }
      }
    });

    this.player.on('error', () => {
      const error = this.player?.error();
      console.error('VideoJS Error:', error);

      // Simple retry logic for critical errors
      if (error?.code && error.code >= 3) { // 3=MEDIA_ERR_DECODE, 4=MEDIA_ERR_SRC_NOT_SUPPORTED
        this.handleFatalError(error);
      } else {
        this.error = `Playback Error: ${error?.message}`;
      }
    });
  }

  private handleFatalError(error: any) {
    console.log('Handling fatal error with restart:', error);
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }

    // Re-create video element container if dispose removed it from DOM? 
    // Video.js dispose() removes the video tag. We need to handle that.
    // In Angular, if we destroy the player that removed the element, we might need to rely on ngIf to re-create it or just reload the route.
    // Simplest robust way: reload route or component.

    this.error = "Stream error, reloading...";

    setTimeout(() => {
      // Force component reload
      // A simple way is to navigate to self or re-run init logic if element persists (it won't with dispose)
      // Let's try navigating to dashboard and back or just reloading page
      // For smoother UX, let's just use window.location.reload() or re-route
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/play', this.route.snapshot.paramMap.get('streamId'), this.route.snapshot.paramMap.get('streamType')]);
      });
    }, 2000);
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

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
