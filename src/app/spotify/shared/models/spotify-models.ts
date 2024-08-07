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
    AudioFeatures:any
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
}