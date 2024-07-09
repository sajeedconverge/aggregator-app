import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        loadChildren: ()=> import('./user/user.module').then(m=> m.UserModule)
    },
    {
        path:'spotify',
        loadChildren: ()=> import('./spotify/spotify.module').then(m=> m.SpotifyModule)
    },
    {
        path:'strava',
        loadChildren: ()=> import('./strava/strava.module').then(m=> m.StravaModule)
    },
];
