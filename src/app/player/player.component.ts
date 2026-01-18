import { Component, ElementRef, OnInit, ViewChild, OnDestroy, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
  private location = inject(Location);
  private xtreamService = inject(XtreamService);

  private player: any;
  error = '';
  streamUrl = '';
  streamType = 'live'; // default

  ngOnInit() {
    if (!this.xtreamService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const streamId = this.route.snapshot.paramMap.get('streamId');
    const streamType = this.route.snapshot.paramMap.get('streamType');
    const containerExtension = this.route.snapshot.paramMap.get('containerExtension');

    if (streamId && streamType) {
      this.initPlayer(streamId, streamType, containerExtension);
    } else {
      this.error = 'Invalid stream parameters';
    }
  }

  initPlayer(streamId: string, streamType: string, containerExtension: string | null) {
    const creds = this.xtreamService.getCredentials();
    if (!creds) return;

    this.streamType = streamType;
    let extension = 'm3u8';
    if (containerExtension) {
      extension = containerExtension;
    }

    // Construct stream URL
    // Standard Xtream Codes structure:
    // Live: /live/username/password/streamId.m3u8
    // VOD: /movie/username/password/streamId.extension
    // Series Episode: /series/username/password/episodeId.extension

    // However, sometimes 'series' type in route might need to map to 'series' in URL, 
    // or 'movie' if the server treats episodes as movies. 
    // Usually usage is:
    // Live -> 'live'
    // Movie -> 'movie'
    // Series Episode -> 'series' (or check if provider uses 'movie')
    // For now assume 'series' maps to 'series' path.

    this.streamUrl = `${this.formatUrl(creds.url)}/${streamType}/${creds.username}/${creds.password}/${streamId}.${extension}`;

    console.log('Stream URL:', this.streamUrl);

    // Initialize Video.js
    const mimeType = this.getMimeType(extension);

    this.player = videojs(this.videoElement.nativeElement, {
      controls: true,
      autoplay: true,
      preload: 'metadata', // metadata is better for VOD to avoid full download
      fluid: true,
      sources: [{
        src: this.streamUrl,
        type: mimeType
      }],
      html5: {
        vhs: {
          overrideNative: true,
          limitRenditionByPlayerDimensions: true,
          useDevicePixelRatio: true
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false
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

  private getMimeType(extension: string): string {
    switch (extension.toLowerCase()) {
      case 'm3u8': return 'application/x-mpegURL';
      case 'ts': return 'video/mp2t';
      // For other containers, default to 'video/mp4' to trick the browser into trying to play it.
      // Browsers often support the codec (H264/AAC) inside MKV/AVI but reject the 'video/x-matroska' mime type.
      case 'mp4':
      case 'mkv':
      case 'avi':
      case 'mov':
      case 'webm':
      default: return 'video/mp4';
    }
  }

  copyStreamUrl() {
    if (this.streamUrl) {
      navigator.clipboard.writeText(this.streamUrl).then(() => {
        alert('Stream URL copied to clipboard!');
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    }
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
    this.location.back();
  }
}
