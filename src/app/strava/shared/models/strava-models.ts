import { PairedTrackJsonObject } from "../../../spotify/shared/models/spotify-models";

export interface StravaSettings {
    clientId: number;
    clientSecret: string;
    redirectClientUrl: string;
    scope: string;
}

export interface PostActivityRequest {
    userEmail: string
    providerActivityId: number
    jsonData: string
}

export interface PostActivityDetailRequest {

    activityId: any
    providerActivityId: number
    jsonData: string

}

export interface ActivityJsonObject {
    name: any
    distance: any
    moving_time: any
    elapsed_time: any
    total_elevation_gain: any
    type: any
    sport_type: any
    start_date: any
    start_date_local: any
    timezone: any
    utc_offset: any
    average_speed: any
    max_speed: any
    average_heartrate: any
    max_heartrate: any
    elev_high: any
    elev_low: any
    upload_id: any
    external_id: any
    suffer_score: any
    calories: any
    end_date: any
    audio: PairedTrackJsonObject[]
    duration_mins: any
    distance_km: any
}