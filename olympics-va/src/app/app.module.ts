import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FirstChartComponent } from './first-chart/first-chart.component';
import { SecondChartComponent } from './second-chart/second-chart.component';
import { MedalChartComponent } from './medal-chart/medal-chart.component';
import { MedalConfComponent } from './medal-conf/medal-conf.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from './data.service';
import { MedalRegionChartComponent } from './medal-region-chart/medal-region-chart.component';
import { MapComponent } from './map/map.component';
import { LoaderService } from './loader.service';

@NgModule({
  declarations: [
    AppComponent,
    FirstChartComponent,
    SecondChartComponent,
    MedalChartComponent,
    MedalConfComponent,
    MedalRegionChartComponent,
    MapComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    DataService,
    LoaderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(){
  }
}
