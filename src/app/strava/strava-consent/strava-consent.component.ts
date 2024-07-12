import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { StravaAuthorizationService } from '../shared/services/strava-authorization.service';
import { StravaService } from '../shared/services/strava.service';

@Component({
  selector: 'app-strava-consent',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    FormsModule
  ],
  templateUrl: './strava-consent.component.html',
  styleUrl: './strava-consent.component.css'
})
export class StravaConsentComponent {


  // constructor(
  //   public stravaAuthService: StravaAuthorizationService,
  //   private stravaService: StravaService
  // ) { }


  // ngOnInit(): void {
  //   this.getAthleteActivities();
  // }

  // callStravaAuth() {
  //   this.stravaAuthService.loginToStrava();
  // }

  // getAthleteActivities() {
  //   this.stravaService.getStravaAthleteActivitiesUrl().subscribe((res) => {
  //     if (res.statusCode === 200) {
  //       this.stravaService.getStravaAthleteActivities(res.payload).subscribe((res) => {
  //         console.log('athlete activities', res);
  //       })
  //     }
  //   })
  // }

}
