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
    info: {
        movie_data: {
            stream_id: number;
            name: string;
            title: string;
            year: string;
            rating: string;
            rating_59: number;
            director: string;
            actors: string;
            cast: string;
            description: string;
            plot: string;
            age: string;
            mpaa_rating: string;
            rating_count_kinopoisk: number;
            country: string;
            genre: string;
            backdrop_path: string[];
            duration_secs: number;
            duration: string;
            video: any;
            audio: any;
            bitrate: number;
            stream_icon: string;
        };
    };
    movie_data: {
        stream_id: number;
        name: string;
        title: string;
        container_extension: string;
    };
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
