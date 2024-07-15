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


    public static spotifyArtistsUrl: string = "https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb";

    public static spotifyPlaylistsUrl: string = 'https://api.spotify.com/v1/playlists/3Hvv07VydednTzQIBnSumd'

}