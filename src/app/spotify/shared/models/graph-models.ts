export interface TracksData{
    trackType:TrackType
    tracks:any[]
}

export enum TrackType {
    RecentlyPlayed,   // 0
    LikedSongs, // 1
    PlaylistTracks,  // 2
    AudioLibrary   // 3
  }