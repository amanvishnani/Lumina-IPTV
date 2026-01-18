import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XtreamVodInfo } from '../types';

@Component({
    selector: 'app-vod-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vod-details.component.html',
    styleUrl: './vod-details.component.css'
})
export class VodDetailsComponent {
    @Input({ required: true }) movieInfo!: XtreamVodInfo;
    @Output() onPlay = new EventEmitter<void>();
    @Output() onDownload = new EventEmitter<void>();

    play() {
        this.onPlay.emit();
    }

    download() {
        this.onDownload.emit();
    }
}
