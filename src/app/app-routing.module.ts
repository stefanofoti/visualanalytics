import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AppComponent } from './app.component';
import { OverviewComponent } from './overview/overview.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent, // this is the component with the <router-outlet> in the template
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
      },
      {
        path: 'overview', // child route path
        component: OverviewComponent, // child route component that the router renders
      },
      {
        path: 'analytics',
        component: AnalyticsComponent, // another child route component that the router renders
      },
      {
        path: 'about',
        component: AboutComponent, // another child route component that the router renders
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
