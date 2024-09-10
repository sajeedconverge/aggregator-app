import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaylistComponent } from './playlist/playlist.component';
import { PlaylistDetailsComponent } from './playlist-details/playlist-details.component';
import { TrackDetailsComponent } from './track-details/track-details.component';
import { AudioHistoryComponent } from './audio-history/audio-history.component';

const routes: Routes = [
  {
    path: 'playlists',
    component: PlaylistComponent
  },
  {
    path: 'playlist-details',
    component: PlaylistDetailsComponent
  },
  {
    path: 'audio-details',
    component: TrackDetailsComponent
  },
  {
    path: 'audio-history',
    component: AudioHistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpotifyRoutingModule { }
