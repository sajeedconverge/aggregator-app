import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaylistComponent } from './playlist/playlist.component';
import { PlaylistDetailsComponent } from './playlist-details/playlist-details.component';
import { TrackDetailsComponent } from './track-details/track-details.component';
import { AudioHistoryComponent } from './audio-history/audio-history.component';
import { AudioLibraryComponent } from './audio-library/audio-library.component';
import { LikedSongsComponent } from './liked-songs/liked-songs.component';
import { SearchTracksComponent } from './search-tracks/search-tracks.component';

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
    path: 'audio-history',
    component: TrackDetailsComponent
  },
  {
    path: 'recently-played',
    component: AudioHistoryComponent
  },
  {
    path: 'audio-library',
    component: AudioLibraryComponent
  },
  {
    path: 'liked-songs',
    component: LikedSongsComponent
  }
  ,
  {
    path: 'search',
    component: SearchTracksComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpotifyRoutingModule { }
