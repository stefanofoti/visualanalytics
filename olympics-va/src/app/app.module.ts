import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FirstChartComponent } from './first-chart/first-chart.component';
import { SecondChartComponent } from './second-chart/second-chart.component';
import { MedalChartComponent } from './medal-chart/medal-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    FirstChartComponent,
    SecondChartComponent,
    MedalChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
