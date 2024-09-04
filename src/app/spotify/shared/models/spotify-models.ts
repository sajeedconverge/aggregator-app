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
    audio_features:any
}

export interface PairedTrackJsonObject {
    //providerTrackId
    distance:number
    distance_end:number
    distance_start:number
    duration_mins:any
    moving_time:number
    pace:number
    played_at:any
    speed:any
    start_time:any
    trackid:string
    track?:any
}

export interface PostTrackAnalysisRequest {
    providerTrackId: string
    trackAnalysisData: string
}

export interface TrackAnalysisJsonObject {
    sections:any[]
    track:any
}




















