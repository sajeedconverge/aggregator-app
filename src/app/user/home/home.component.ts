import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { SpotifyAuthorizationService } from '../../spotify/shared/services/spotify-authorization.service';
import { StravaAuthorizationService } from '../../strava/shared/services/strava-authorization.service';
import { StravaService } from '../../strava/shared/services/strava.service';
import { Table, TableModule } from 'primeng/table';
import { Constants } from '../../shared/Constants';
import { CommonModule, DatePipe } from '@angular/common';
import { SpotifyService } from '../../spotify/shared/services/spotify.service';
import { HttpHeaders } from '@angular/common/http';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { Message, MessageService, PrimeNGConfig } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { PostActivityDetailRequest, PostActivityRequest } from '../../strava/shared/models/strava-models';
import { AuthService } from '../shared/services/auth.service';
import { PairedTrackJsonObject, PostTrackRequest, TrackMetricRequest } from '../../spotify/shared/models/spotify-models';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { RoundPipe } from '../../shared/common-pipes/round.pipe';
import { Title } from '@angular/platform-browser';
import { ActivityDetailChartComponent } from '../../strava/shared/activity-detail-chart/activity-detail-chart.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule,
    TableModule,
    DatePipe,
    ProgressBarComponent,
    MessagesModule,
    ToastModule,
    BadgeModule,
    TooltipModule,
    RoundPipe,
    ActivityDetailChartComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [MessageService]
})
export class HomeComponent implements OnInit, OnDestroy {
  checkInterval: any;
  messages: Message[] = [
    { severity: 'warn', detail: 'Strava or Spotify not linked. Please, link them first.' },
  ];
  isStravaLinked: boolean = true;
  isLoading: boolean = false;



  constructor(
    private stravaService: StravaService,
    private spotifyAuthService: SpotifyAuthorizationService,
    private spotifyService: SpotifyService,
    private title: Title
  ) {
    this.title.setTitle('AudioActive - Home');
    this.spotifyAuthService.checkExpiryAndRefreshToken();
    this.fetchThirdPartyDetails();
  }

  ngOnInit(): void {


  }

  ngOnDestroy(): void {
    // Ensure to clear the interval if the component is destroyed
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    };
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
    this.stravaService.getStravaData().subscribe((res) => {
      if (res.statusCode === 200) {
        Constants.stravaSettings = res.payload;
      }
    });
  }




}
