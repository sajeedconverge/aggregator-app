import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        loadChildren: ()=> import('./user/user.module').then(m=> m.UserModule)
    },
];
