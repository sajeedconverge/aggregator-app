import { Component, OnInit } from '@angular/core';
import { Constants } from '../../shared/Constants';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SpotifyService } from '../shared/services/spotify.service';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RoundPipe } from "../../shared/common-pipes/round.pipe";
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { UriPipe } from "../../shared/common-pipes/uri.pipe";
import { DialogModule } from 'primeng/dialog';
import { SpotifyAuthorizationService } from '../shared/services/spotify-authorization.service';
import { ToastModule } from 'primeng/toast';





@Component({
  selector: 'app-search-tracks',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    OverlayPanelModule,
    FormsModule,
    TableModule,
    ProgressBarComponent,
    ConfirmDialogModule,
    RoundPipe,
    InputTextModule,
    UriPipe,
    DialogModule,
    ToastModule,





  ],
  templateUrl: './search-tracks.component.html',
  styleUrl: './search-tracks.component.css',
  providers: [
    ConfirmationService,
    DialogService
  ]
})
export class SearchTracksComponent implements OnInit {
  isLoading: boolean = false;
  searchText: string = '';
  searchedTracks: any[] = [];
  limit: number = 50;
  showPreview: boolean = false;
  currentTrack: any;
  ref: DynamicDialogRef | undefined;
  dataMessage: string = 'No tracks';
  totalCount: number = 0;







  constructor(
    private title: Title,
    private spotifyService: SpotifyService,
    private router: Router,
    private spotifyAuthService: SpotifyAuthorizationService,
    private messageService: MessageService,
  ) {
    this.title.setTitle('AudioActive - Search')
  }

  ngOnInit(): void {

  }




  searchSpotify() {
    this.isLoading = true;
    this.spotifyAuthService.refreshSpotifyAccessToken();
    var searchUrl = Constants.spotifySearchUrl(this.searchText, this.limit);
    const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
    this.spotifyService.SpotifyCommonGetApi(searchUrl, spotifyAccessToken).subscribe((response) => {
      this.totalCount = response.tracks.total;
      this.searchedTracks = response.tracks.items;
      console.log(this.searchedTracks);


      this.searchedTracks.forEach((track) => {
        // audio features
        this.spotifyService.getTrackById(track.id).subscribe((dbTrackRes) => {
          if (dbTrackRes.statusCode === 200) {
            // console.log('track found', dbTrackRes.payload.jsonData.name);
            track.audio_features = dbTrackRes.payload.jsonData.audio_features;
          } else {
            //console.log('track not found', track.name);
            //this.nonSavedTrackIds.push(track.id);

            this.spotifyService.getSpotifyAudioFeaturesUrl(track.id).subscribe((res) => {
              if (res.statusCode === 200) {
                var featuresUrl = res.payload;
                const spotifyAccessToken = sessionStorage.getItem('spotify-bearer-token') || '';
                this.spotifyService.SpotifyCommonGetApi(featuresUrl, spotifyAccessToken).subscribe((res) => {
                  track.audio_features = res;
                  track.audio_features.tempo = Math.round(track.audio_features.tempo);
                  track.audio_features.loudness = Math.round(track.audio_features.loudness * (-10));
                  track.audio_features.energy = Math.round(track.audio_features.energy * (100));
                  track.audio_features.danceability = Math.round(track.audio_features.danceability * (100));
                });
              };
            });

          };
        });
      });



      setTimeout(() => {
        this.isLoading = false;
      }, 5000);

    }, error => {
      this.messageService.add({ severity: 'warn', summary: 'Request Failed !', detail: 'Please try again.' });
      this.isLoading = false;
    });
  }






  formatTrackDuration(durationMs: number) {
    return Constants.formatDuration(durationMs);
  }

  navigateToTrackDetails(trackName: string, trackId: string) {
    sessionStorage.setItem('track-name', trackName);
    sessionStorage.setItem('track-id', trackId);
    this.router.navigate(['/spotify/audio-history']);
  }

  showPreviewPopup(track: any) {
    this.showPreview = true;
    this.currentTrack = track;
  }

  onPageChange(event: any) {
    this.limit = event.rows;

  }

  clearSearch() {
    this.searchedTracks = [];
  }













}
