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
import { PlaylistDetailsComponent } from '../playlist-details/playlist-details.component';
import { Router } from '@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { ButtonGroupModule } from 'primeng/buttongroup';



@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgressBarComponent,
    MessagesModule,
    TableModule,
    ButtonModule,
    PlaylistDetailsComponent,
    InputSwitchModule,
    ButtonGroupModule
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
  isGrid: boolean = true;




  constructor(
    private spotifyService: SpotifyService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private router: Router
  ) {
    this.spotifyAuthService.checkExpiryAndRefreshToken();
    this.startCheckingToken();
    this.fetchThirdPartyDetails();
  }

  ngOnInit(): void {
    //this.isLoading = true;

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
    //this.spotifyAuthService.checkExpiryAndRefreshToken();
    this.spotifyService.getCurrentUserPlaylistsUrl().subscribe((res) => {
      if (res.statusCode === 200) {
        var playlistsUrl = res.payload;
        this.spotifyService.SpotifyCommonGetApi(playlistsUrl, spotifyAccessToken).subscribe((playlistResponse) => {
          this.userPlaylists = playlistResponse.items;
          console.log(this.userPlaylists);
          //to assign other properties
          this.assignPlaylistProperties();
        });
        this.isLoading = false;
      }
    })
  }

  assignPlaylistProperties() {
    this.userPlaylists.forEach(playlist => {
      var tracksUrl = playlist.tracks.href;
      const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
      this.spotifyService.SpotifyCommonGetApi(tracksUrl, spotifyAccessToken).subscribe((tracksResponse) => {
        //console.log(playlist.name, tracksResponse.items);
        playlist.songs = tracksResponse.items;
        playlist.duration_ms = 0;
        playlist.songs.forEach((t: any) => { playlist.duration_ms += t.track.duration_ms });
        playlist.duration_ms = Constants.formatMilliseconds(playlist.duration_ms);
        //console.log('total duration :', playlist.duration_ms)
        var severalIds: string = playlist.songs.map((t: any) => t.track.id).join(',');

        if (playlist.songs.length > 0) {
          this.spotifyService.getSeveralAudioFeaturesUrl(severalIds).subscribe((safUrlResponse) => {
            if (safUrlResponse.statusCode === 200) {
              var safUrl = safUrlResponse.payload;
              this.spotifyService.SpotifyCommonGetApi(safUrl, spotifyAccessToken).subscribe((safResponse) => {

                safResponse.audio_features.forEach((audioFeature: any) => {
                  var matchedSong = playlist.songs.find((song: any) => song.track.id === audioFeature.id);
                  matchedSong.audio_features = audioFeature;
                  // Extracting the tempo values
                  const tempos = playlist.songs.map((song: any) => song.audio_features?.tempo);
                  // console.log('tempos', tempos);
                  
                  // Finding the minimum and maximum tempo
                  playlist.minTempo = Math.min(...tempos);
                  playlist.maxTempo = Math.max(...tempos);


                });
              });
            };
          });
        }

      });
    })
  }


  getPlayListTracks(url: string, playlistName: string, id: string, snapShotId: string) {
    sessionStorage.setItem('playlist-items-url', url);
    sessionStorage.setItem('playlist-name', playlistName);
    sessionStorage.setItem('playlist-id', id);
    sessionStorage.setItem('playlist-snapshot-id', snapShotId);
    this.router.navigate(['/spotify/playlist-details'])
  }


}
