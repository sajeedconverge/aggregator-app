import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { commonGuard } from './shared/security/guards/common.guard';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: SigninComponent
  }, 
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [commonGuard]
  }, 
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [commonGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
