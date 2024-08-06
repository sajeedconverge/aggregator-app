import { Component, OnInit } from '@angular/core';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { SpotifyAuthorizationService } from '../shared/services/spotify-authorization.service';
import { SpotifyService } from '../shared/services/spotify.service';
import { Constants } from '../../shared/Constants';
import { HttpHeaders } from '@angular/common/http';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarComponent,
    MessagesModule,
    TableModule,
    ButtonModule,

  ],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.css'
})
export class PlaylistComponent implements OnInit {
  isLoading: boolean = false;
  checkInterval: any;
  isSpotifyLinked: boolean = true;
  userPlaylists: any[] = [];
  messages: Message[] = [
    { severity: 'warn', detail: 'Spofity not linked. Please, link spotify.' },
  ];
  playlistTracks: any[] = [];
  showTracks: boolean = false;
  currentPlayListName: string = '';
  showAudioFeatures: boolean = false;
  audioFeatures: any[] = [];
  currentTrackName: string = '';





  constructor(
    private spotifyService: SpotifyService,
    private spotifyAuthService: SpotifyAuthorizationService
  ) { }

  ngOnInit(): void {
    //this.isLoading = true;
    this.startCheckingToken();
    this.fetchThirdPartyDetails();
  }

  ngOnDestroy(): void {
    // Ensure to clear the interval if the component is destroyed
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    };
  }

  startCheckingToken(): void {
    this.checkInterval = setInterval(() => {
      const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
      if (spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0) {
        this.getCurrentUserPlaylists(spotifyAccessToken);
        this.isSpotifyLinked = true;
        clearInterval(this.checkInterval); // Stop the interval
      } else {
        this.isSpotifyLinked = false;
      }
    }, 2000); // Check every 2 seconds, adjust as needed
  }

  //refresh third party details
  fetchThirdPartyDetails() {
    this.spotifyService.getSpotifyData().subscribe((res) => {
      if (res.statusCode === 200) {
        Constants.spotifySettings = res.payload;
        Constants.spotifyHeader = new HttpHeaders({
          //'Authorization': 'Basic ' + btoa('a3470aef0a5e4ca5bcb06600c262f026' + ':' + '25e7aab330324d8ba368c08e7b4a5800'),
          'Authorization': 'Basic ' + btoa(Constants.spotifySettings.clientId + ':' + Constants.spotifySettings.clientSecret),
          'Content-Type': 'application/x-www-form-urlencoded',
        });
      };
    });
  }

  //To get the Current User's playlists from Spotify
  getCurrentUserPlaylists(spotifyAccessToken: any) {
    this.isLoading = true;
    this.spotifyAuthService.refreshSpotifyAccessToken();
    this.spotifyService.getCurrentUserPlaylistsUrl().subscribe((res) => {
      if (res.statusCode === 200) {
        var playlistsUrl = res.payload;
        this.spotifyService.SpotifyCommonGetApi(playlistsUrl, spotifyAccessToken).subscribe((playlistResponse) => {
          this.userPlaylists = playlistResponse.items;
          console.log(this.userPlaylists);
          this.isLoading = false;
        });

      }
    })
  }

  getPlayListTracks(url: string, playlistName: string) {
    this.spotifyAuthService.refreshSpotifyAccessToken();
    this.playlistTracks = [];
    this.showTracks = true;
    this.isLoading = true;
    this.currentPlayListName = playlistName;
    const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
    if (spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0) {
      this.spotifyService.SpotifyCommonGetApi(url, spotifyAccessToken).subscribe((res) => {
        this.playlistTracks = res.items;
        console.log("this.playlistTracks", this.playlistTracks);
        this.isLoading = false;
      });
    };
  }

  openInSpotify(url: string) {
    window.open(url, '_blank');
  }

  //To get audio features
  getAudioFeatures(trackId: string, trackName: string) {
    this.audioFeatures = [];
    this.currentTrackName = trackName;
    this.spotifyAuthService.refreshSpotifyAccessToken();
    this.spotifyService.getSpotifyAudioFeaturesUrl(trackId).subscribe((res) => {
      if (res.statusCode === 200) {
        var featuresUrl = res.payload;
        const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
        this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
          this.audioFeatures.push(res);
          this.showAudioFeatures = true;
        })

      }
    })
  }







}
