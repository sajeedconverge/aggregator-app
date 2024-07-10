import { Routes } from '@angular/router';
import { commonGuard } from './user/shared/security/guards/common.guard';
import { HomeComponent } from './user/home/home.component';

export const routes: Routes = [
    {
        path:'',
        loadChildren: ()=> import('./user/user.module').then(m=> m.UserModule)
    },
    // {
    //     path: '',
    //     component: SigninComponent
    //   },
    //  {
    //     path: '',
    //     component: HomeComponent,
    //     canActivate: [commonGuard]
    //   },
    {
        path:'spotify',
        loadChildren: ()=> import('./spotify/spotify.module').then(m=> m.SpotifyModule),
        canActivate:[commonGuard]
    },
    {
        path:'strava',
        loadChildren: ()=> import('./strava/strava.module').then(m=> m.StravaModule),
        canActivate:[commonGuard]
    },
];
