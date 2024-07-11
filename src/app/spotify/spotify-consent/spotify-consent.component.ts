import { Component } from '@angular/core';
import { SpotifyService } from '../shared/services/spotify.service';
import { SpotifyAuthorizationService } from '../shared/services/spotify-authorization.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-spotify-consent',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule
  ],
  templateUrl: './spotify-consent.component.html',
  styleUrl: './spotify-consent.component.css'
})
export class SpotifyConsentComponent {
  artistsResponse: any;
  artistsResponseString: string = '';

  constructor(
    private spotifyService: SpotifyService,
    public spotifyAuthService: SpotifyAuthorizationService,
  ) { }

  ngOnInit(): void {
    // window.addEventListener('message', this.receiveMessage.bind(this), false);
    //window.addEventListener('message', this.receiveMessage.bind(this), false);
  }
  // ngOnDestroy() {
  //   window.removeEventListener('message', this.receiveMessage.bind(this), false);
  // }

  callSpotifyAuth() {
    this.spotifyAuthService.loginToSpotify();
  }

  // //#To extract the authcode (Spotify)
  // receiveMessage(event: MessageEvent) {
  //   // Ensure the message is from the expected origin
  //   if (event.origin !== 'http://localhost:4200') {
  //     return;
  //   }
  //   try {
  //     // Handle the received message (new URL)
  //     const newUrl = event.data;
  //     const urlObj = new URL(newUrl);
  //     // Use the new URL to extract the authorization code and get the token
  //     const authCode = urlObj.searchParams.get('code');
  //     this.spotifyAuthService.getSpotifyAccessToken(authCode);
  //     //console.log('authCode  ', authCode)
  //   } catch (error) {
  //     //console.error('Invalid URL received:', event.data);
  //   }
  // }

  getArtists() {
    const spotifyBearerToken: string = localStorage.getItem('spotify-bearer-token') || '';
    this.spotifyService.getArtists(spotifyBearerToken).subscribe((res) => {
      if (res) {
        this.artistsResponse = res;
        this.artistsResponseString = JSON.stringify(this.artistsResponse);
        console.log("artists response", this.artistsResponse);
      };
    });
  }

  getPlaylists() {
    const spotifyBearerToken: string = localStorage.getItem('spotify-bearer-token') || '';
    this.spotifyService.getPlaylists(spotifyBearerToken).subscribe((res) => {
      if (res) {
        this.artistsResponse = res;
        this.artistsResponseString = JSON.stringify(this.artistsResponse);
        console.log("playlists response", this.artistsResponse);
      };
    });
  }
}
