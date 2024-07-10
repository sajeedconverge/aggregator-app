import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StravaConsentComponent } from './strava-consent/strava-consent.component';

const routes: Routes = [
  {
    path:'consent',
    component:StravaConsentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StravaRoutingModule { }
