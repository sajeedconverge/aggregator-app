import { HttpHeaders } from "@angular/common/http";

export class Constants {

    public static baseServerUrl: string = 'https://localhost:44354/api/v1';
    // public static baseServerUrl: string = 'https://aggregatorwebapi.azurewebsites.net/api/v1';
    public static isLoggedInFlag: boolean = false;

    public static spotifyHeader = new HttpHeaders({
        //harsh
        //'Authorization': 'Basic ' + btoa('221899f30e1b45f39b4ae86c9a9ecdc0' + ':' + '78655812d9874a23ab110b34125d5aaf'),
        //sajeed sir
        'Authorization': 'Basic ' + btoa('a3470aef0a5e4ca5bcb06600c262f026' + ':' + '25e7aab330324d8ba368c08e7b4a5800'),

        'Content-Type': 'application/x-www-form-urlencoded',
    });

    public static spotifyTokenUrl: string = "https://accounts.spotify.com/api/token";

    public static spotifyArtistsUrl: string = "https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb";

    public static spotifyBearerToken:string='';


}