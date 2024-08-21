import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SpotifyService } from '../shared/services/spotify.service';
import { SpotifyAuthorizationService } from '../shared/services/spotify-authorization.service';
import { Constants } from '../../shared/Constants';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-playlist-details',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarComponent,
    MessagesModule,
    TableModule,
    ButtonModule,
  ],
  templateUrl: './playlist-details.component.html',
  styleUrl: './playlist-details.component.css'
})
export class PlaylistDetailsComponent implements OnInit {
  audioFeatures: any[] = [];
  playlistTracks: any[] = [];
  currentPlayListName: string = '';
  currentTrackName = '';
  showAudioFeatures: boolean = false;
  checkInterval: any;
  isLoading: boolean = false;

  constructor(
    private spotifyService: SpotifyService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private router: Router
  ) {
    this.fetchThirdPartyDetails();
    this.startCheckingToken();
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    // Ensure to clear the interval if the component is destroyed
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    };
  }

  startCheckingToken(): void {
    this.isLoading = true;
    this.checkInterval = setInterval(() => {
      const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
      if (spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0) {
        this.getPlayListTracks();
        clearInterval(this.checkInterval); // Stop the interval
      } else {
        this.fetchThirdPartyDetails();
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

  getPlayListTracks() {
    // this.isLoading = true;
    this.playlistTracks = [];
    this.spotifyAuthService.refreshSpotifyAccessToken();
    var url = sessionStorage.getItem('playlist-items-url') || '';
    var playlistName = sessionStorage.getItem('playlist-name') || '';

    this.currentPlayListName = playlistName;
    const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
    if (spotifyAccessToken.length > 0 && Constants.spotifySettings.clientId.length > 0) {
      this.isLoading = true;
      this.spotifyService.SpotifyCommonGetApi(url, spotifyAccessToken).subscribe((resp) => {
        this.playlistTracks = resp.items;
        // To assign Audio Features to the track
        this.playlistTracks.forEach(pltrack => {
          this.spotifyService.getSpotifyAudioFeaturesUrl(pltrack.track.id).subscribe((res) => {
            if (res.statusCode === 200) {
              var featuresUrl = res.payload;
              const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
              this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
                pltrack.audioFeatures = res;
              });

            }
          });
        });
        this.isLoading = false;
        console.log('original',this.playlistTracks);
      });
    };
  }


  // getAudioFeatures(trackId: string, trackName: string) {
  //   this.audioFeatures = [];
  //   this.currentTrackName = trackName;
  //   //this.spotifyAuthService.refreshSpotifyAccessToken();
  //   this.spotifyService.getSpotifyAudioFeaturesUrl(trackId).subscribe((res) => {
  //     if (res.statusCode === 200) {
  //       var featuresUrl = res.payload;
  //       const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
  //       this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
  //         this.audioFeatures.push(res);
  //         this.showAudioFeatures = true;
  //       })

  //     }
  //   });
  // }

  formatTrackDuration(durationMs: number) {
    return Constants.formatDuration(durationMs);
  }

  backToPlaylists() {
    //   this.closeEvent.emit(false);
    this.router.navigate(['/spotify/playlists'])
  }

  updatePlaylist() {
    console.log('Reordered',this.playlistTracks);
  }
}
