export interface XtreamCredentials {
    url: string;
    username: string;
    password: string;
}

export interface XtreamLoginResponse {
    user_info?: {
        auth: number;
        status: string;
        exp_date: string;
        is_trial: string;
        active_cons: string;
        max_connections: string;
        message: string;
    };
    server_info?: {
        url: string;
        port: string;
        https_port: string;
        server_protocol: string;
        rtmp_port: string;
        timezone: string;
        timestamp: number;
        time_now: string;
    };
}

export interface XtreamCategory {
    category_id: string;
    category_name: string;
    parent_id: number;
}

export interface XtreamStream {
    num: number;
    name: string;
    stream_type: string;
    stream_id: number;
    stream_icon: string;
    epg_channel_id: string;
    added: string;
    category_id: string;
    custom_sid: string;
    tv_archive: number;
    direct_source: string;
    tv_archive_duration: number;
    thumbnail: string;
    title: string;
    container_extension: string;
}

export interface XtreamVodInfo {
    info: Info;
    movie_data: MovieData;
}
export interface Info {
    audio: Audio
    backdrop: string
    backdrop_path: any[]
    bitrate: number
    cast: string
    director: string
    duration: string
    duration_secs: number
    genre: string
    movie_image: string
    plot: string
    rating: string
    releasedate: string
    tmdb_id: string
    video: Video
    youtube_trailer: string
}

export interface Audio {
    avg_frame_rate: string
    bits_per_sample: number
    channel_layout: string
    channels: number
    codec_long_name: string
    codec_name: string
    codec_tag: string
    codec_tag_string: string
    codec_time_base: string
    codec_type: string
    disposition: Disposition
    index: number
    profile: string
    r_frame_rate: string
    sample_fmt: string
    sample_rate: string
    start_pts: number
    start_time: string
    tags: Tags
    time_base: string
}

export interface Disposition {
    attached_pic: number
    clean_effects: number
    comment: number
    default: number
    dub: number
    forced: number
    hearing_impaired: number
    karaoke: number
    lyrics: number
    original: number
    timed_thumbnails: number
    visual_impaired: number
}

export interface Tags {
    BPS: string
    DURATION: string
    NUMBER_OF_BYTES: string
    NUMBER_OF_FRAMES: string
    _STATISTICS_TAGS: string
    _STATISTICS_WRITING_APP: string
    _STATISTICS_WRITING_DATE_UTC: string
}

export interface Video {
    avg_frame_rate: string
    bits_per_raw_sample: string
    chroma_location: string
    codec_long_name: string
    codec_name: string
    codec_tag: string
    codec_tag_string: string
    codec_time_base: string
    codec_type: string
    coded_height: number
    coded_width: number
    color_primaries: string
    color_range: string
    color_space: string
    color_transfer: string
    display_aspect_ratio: string
    disposition: Disposition2
    field_order: string
    has_b_frames: number
    height: number
    index: number
    is_avc: string
    level: number
    nal_length_size: string
    pix_fmt: string
    profile: string
    r_frame_rate: string
    refs: number
    sample_aspect_ratio: string
    start_pts: number
    start_time: string
    tags: Tags2
    time_base: string
    width: number
}

export interface Disposition2 {
    attached_pic: number
    clean_effects: number
    comment: number
    default: number
    dub: number
    forced: number
    hearing_impaired: number
    karaoke: number
    lyrics: number
    original: number
    timed_thumbnails: number
    visual_impaired: number
}

export interface Tags2 {
    BPS: string
    DURATION: string
    NUMBER_OF_BYTES: string
    NUMBER_OF_FRAMES: string
    _STATISTICS_TAGS: string
    _STATISTICS_WRITING_APP: string
    _STATISTICS_WRITING_DATE_UTC: string
}

export interface MovieData {
    added: string
    category_id: string
    container_extension: string
    custom_sid: string
    direct_source: string
    name: string
    stream_id: number
}

export interface XtreamSeries {
    num: number;
    name: string;
    series_id: number;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    last_modified: string;
    rating: string;
    rating_59: number;
    backdrop_path: string[];
    youtube_trailer: string;
    episode_run_time: string;
    category_id: string;
}

export interface XtreamEpisode {
    id: string;
    episode_num: number;
    title: string;
    container_extension: string;
    info: any;
    custom_sid: any;
    added: string;
    season: number;
    direct_source: string;
}

export interface XtreamSeriesInfo {
    seasons: any[];
    info: any;
    episodes: { [key: string]: XtreamEpisode[] };
}

export interface DownloadMetadata {
    id: string;
    streamId: number;
    title: string;
    posterUrl: string;
    fileSize: number;
    downloadedSize: number;
    status: 'downloading' | 'paused' | 'completed' | 'failed';
    filePath: string;
    extension: string;
    createdAt: string;
    completedAt?: string;
}
