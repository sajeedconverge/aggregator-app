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
    album: any
    artists: any[]
    duration_ms: number
    id: string
    name: string
    popularity: number
    type: string
    uri: string
    audio_features: any
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

export interface TrackMetricRequest{
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
  }













