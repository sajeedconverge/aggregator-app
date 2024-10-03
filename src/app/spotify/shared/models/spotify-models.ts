export interface SpotifySettings {
    clientId: string;
    clientSecret: string;
    scopes: string;
    redirectClientUrl: string;
}

export interface PostTrackRequest {
    providerTrackId: string
    trackData: string
}


export interface TrackJsonObject {
    album: Album
    artists: Artist[]
    duration_ms: number
    id: string
    name: string
    popularity: number
    type: string
    uri: string
    audio_features: AudioFeatures
}

export interface PairedTrackJsonObject {
    //providerTrackId
    distance: number
    distance_end: number
    distance_start: number
    duration_mins: any
    moving_time: number
    pace: number
    played_at: any
    speed: any
    start_time: any
    trackid: string
    track?: any
    isOmitted:boolean
}

export interface PostTrackAnalysisRequest {
    providerTrackId: string
    trackAnalysisData: string
}

export interface TrackAnalysisJsonObject {
    sections: any[]
    track: AnalysisTrackDetail
}


export interface AnalysisTrackDetail {
    num_samples: number,
    duration: number,
    sample_md5: string,
    offset_seconds: number,
    window_seconds: number,
    analysis_sample_rate: number,
    analysis_channels: number,
    end_of_fade_in: number,
    start_of_fade_out: number,
    loudness: number,
    tempo: number,
    tempo_confidence: number,
    time_signature: number,
    time_signature_confidence: number,
    key: number,
    key_confidence: number,
    mode: number,
    mode_confidence: number,
}

export interface TrackMetricRequest {
    id: string
    userId: string
    providerActivityId: number
    providerTrackId: string
    distance: number
    distance_start: number
    distance_end: number
    duration_mins: string
    moving_time: string
    pace: string
    played_at: string
    speed: number
    start_time: string
    isOmitted:boolean
}


export interface FilterRequest {
    name?: Parameter[];
    artist?: Parameter[];
    duration?: Parameter[];
    tempo?: Parameter[];
    danceability?: Parameter[];
    energy?: Parameter[];
    loudness?: Parameter[];
    pageSize: number
    sortField: string
    sortOrder: number
}

export interface Parameter {
    value: any;
    matchMode: string;
    operator: string;
}

export interface Album {
    type: string
    album_type: string
    href: string
    id: string
    images: Image[]
    name: string
    release_date: string
    release_date_precision: string
    uri: string
    artists: Artist[]
    external_urls: ExternalUrls
    total_tracks: number
}


export interface Image {
    height: number
    url: string
    width: number
}

export interface Artist {
    external_urls: ExternalUrls
    href: string
    id: string
    name: string
    type: string
    uri: string
}

export interface ExternalUrls {
    spotify: string
}

export interface AudioFeatures {
    danceability: number
    energy: number
    key: number
    loudness: number
    mode: number
    speechiness: number
    acousticness: number
    instrumentalness: number
    liveness: number
    valence: number
    tempo: number
    type: string
    id: string
    uri: string
    track_href: string
    analysis_url: string
    duration_ms: number
    time_signature: number
}

export interface Section {
    start: number
    duration: number
    confidence: number
    loudness: number
    tempo: number
    tempo_confidence: number
    key: number
    key_confidence: number
    mode: number
    mode_confidence: number
    time_signature: number
    time_signature_confidence: number
}

