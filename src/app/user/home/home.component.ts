import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { catchError, map } from 'rxjs';
import { SpotifyService } from '../../shared/services/spotify.service';
import { Constants } from '../../shared/Constants';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  display: boolean = false;
  url: string = '';
  artistsResponse: any;
  artistsResponseString: string = '';

  constructor(
    private spotifyService: SpotifyService
  ) { }

  ngOnInit(): void {
    window.addEventListener('message', this.receiveMessage.bind(this), false);
  }
  ngOnDestroy() {
    window.removeEventListener('message', this.receiveMessage.bind(this), false);
  }

  openLoginModal() {
  }



  loginToSpotify() {
    //var url = new URL('https://accounts.spotify.com/authorize');
    // const scopes = 'user-read-private user-read-email playlist-modify-private';
    // //harsh
    // url.searchParams.set('client_id', "221899f30e1b45f39b4ae86c9a9ecdc0");
    // //sajeed sir
    // //  url.searchParams.set('client_id', "a3470aef0a5e4ca5bcb06600c262f026");
    // url.searchParams.set('redirect_uri', "http://localhost:4200/home");
    // url.searchParams.set('scope', scopes);
    // url.searchParams.set('response_type', 'code');
    // url.searchParams.set('show_dialog', 'true');
    // // Open the URL in a new window that looks like a dialog
    // const width = 500;
    // const height = 600;
    // const left = (screen.width / 2) - (width / 2);
    // const top = (screen.height / 2) - (height / 2);
    // const loginWindow = window.open(url.toString(), 'Spotify Login', `width=${width},height=${height},top=${top},left=${left}`);
    // // Check the window URL periodically
    // const intervalId = setInterval(() => {
    //   try {
    //     if (loginWindow && loginWindow.closed) {
    //       clearInterval(intervalId);
    //     } else if (loginWindow && loginWindow.location.href !== url.toString()) {
    //       // Send the new URL back to the main window
    //       window.postMessage(loginWindow.location.href, 'http://localhost:4200');
    //       loginWindow.close();
    //       clearInterval(intervalId);
    //     }
    //   } catch (e) {
    //     // Cross-origin error, wait for the same-origin response
    //   }
    // }, 500);

    var url: any;
    this.spotifyService.getSpotifyAuthUrl().subscribe((res) => {
      if (res) {
        //console.log(res);
        url = new URL(res.payload);

        // Open the URL in a new window that looks like a dialog
        const width = 500;
        const height = 600;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);

        const loginWindow = window.open(url.toString(), 'Spotify Login', `width=${width},height=${height},top=${top},left=${left}`);

        // Check the window URL periodically
        const intervalId = setInterval(() => {
          try {
            if (loginWindow && loginWindow.closed) {
              clearInterval(intervalId);
            } else if (loginWindow && loginWindow.location.href !== url.toString()) {
              // Send the new URL back to the main window
              window.postMessage(loginWindow.location.href, 'http://localhost:4200');
              loginWindow.close();
              clearInterval(intervalId);
            }
          } catch (e) {
            // Cross-origin error, wait for the same-origin response
          }
        }, 500);
      };
    });





  }



  receiveMessage(event: MessageEvent) {
    // Ensure the message is from the expected origin
    if (event.origin !== 'http://localhost:4200') {
      return;
    }
    try {
      // Handle the received message (new URL)
      const newUrl = event.data;
      const urlObj = new URL(newUrl);

      // Use the new URL to extract the authorization code and get the token
      const authCode = urlObj.searchParams.get('code');
      //console.log("authCode", authCode);
      //console.log("newUrl", newUrl);

      this.getTokenFromCode(authCode);
    } catch (error) {
      //console.error('Invalid URL received:', event.data);
    }
  }



  getTokenFromCode(authCode: any) {
    var body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', authCode);
    body.set('redirect_uri', "http://localhost:4200/home");

    this.spotifyService.getSpotifyAccessToken(body).subscribe(res => {
      if (res) {
        debugger;
        console.log(res);
        Constants.spotifyBearerToken = res.access_token;
        sessionStorage.setItem('spotifyBearerToken', res.access_token);
      };
    });
  }


  getArtists() {
    debugger;
    this.spotifyService.getArtists(Constants.spotifyBearerToken).subscribe((res) => {
      if (res) {
        this.artistsResponse = res;
        this.artistsResponseString = JSON.stringify(this.artistsResponse);
        console.log("artists response", this.artistsResponse);
      };
    });
  }

  getPlaylists() {
    this.spotifyService.getPlaylists(Constants.spotifyBearerToken).subscribe((res) => {
      if (res) {
        this.artistsResponse = res;
        this.artistsResponseString = JSON.stringify(this.artistsResponse);
        console.log("playlists response", this.artistsResponse);
      };
    });
  }

}
