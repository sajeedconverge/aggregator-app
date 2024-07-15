import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpotifyConsentComponent } from './spotify-consent/spotify-consent.component';
import { PlaylistComponent } from './playlist/playlist.component';

const routes: Routes = [
  {
    path:'playlists',
    component:PlaylistComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpotifyRoutingModule { }
