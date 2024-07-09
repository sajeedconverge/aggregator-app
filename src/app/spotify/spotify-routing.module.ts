import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpotifyConsentComponent } from './spotify-consent/spotify-consent.component';

const routes: Routes = [
  {
    path:'consent',
    component:SpotifyConsentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpotifyRoutingModule { }
