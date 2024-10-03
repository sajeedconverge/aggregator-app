import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivitiesComponent } from './activities/activities.component';
import { ActivityDetailsComponent } from './activity-details/activity-details.component';

const routes: Routes = [
  {
    path:'activities',
    component:ActivitiesComponent
  },
  {
    path:'activity-details',
    component:ActivityDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StravaRoutingModule { }
