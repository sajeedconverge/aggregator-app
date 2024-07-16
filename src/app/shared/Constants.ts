import { HttpHeaders } from "@angular/common/http";
import { SpotifySettings } from "../spotify/shared/models/spotify-models";
import { StravaSettings } from "../strava/shared/models/strava-models";

export class Constants {

    public static baseServerUrl: string = 'https://localhost:44354/api/v1';
    // public static baseServerUrl: string = 'https://aggregatorwebapi.azurewebsites.net/api/v1';

    //public static isLoggedInFlag: boolean = false;


    public static spotifySettings: SpotifySettings = {
        clientId: "",
        clientSecret: "",
        scopes: "",
        redirectClientUrl: ""
    }

    public static stravaSettings: StravaSettings = {
        clientId: 0,
        clientSecret: "",
        redirectClientUrl: "",
        scope: ""
    }



    public static spotifyHeader = new HttpHeaders({});

    public static stravaHeader = new HttpHeaders({
        'Content-Type': 'application/json',
    });

    //To calculate the starting time of played track
    public static getTrackStartTime(endTime: string, duration_ms: number): string {
        // Convert endTime to a Date object
        const endDate = new Date(endTime);
        // Subtract the duration from the endDate
        const startDate = new Date(endDate.getTime() - duration_ms);
        // Convert the resulting Date object back to an ISO string
        return startDate.toISOString();
    }

    //To calculate the end time of the activity
    public static getActivityEndTime(startDate: string, elapsed_time: number): string {
        // Convert startDate to a Date object
        const startDateObj = new Date(startDate);
        // Add the elapsed time (in seconds) to the startDate
        const endDateObj = new Date(startDateObj.getTime() + elapsed_time * 1000);
        // Convert the resulting Date object back to an ISO string
        return endDateObj.toISOString();
    }



}