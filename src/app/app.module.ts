import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FirstChartComponent } from './first-chart/first-chart.component';
import { SecondChartComponent } from './second-chart/second-chart.component';
import { MedalChartComponent } from './medal-chart/medal-chart.component';
import { MedalProgressionChartComponent } from './medal-progression-chart/medal-progression-chart.component';
import { ConfComponent } from './conf/conf.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from './data.service';
import { MedalRegionChartComponent } from './medal-region-chart/medal-region-chart.component';
import { MapComponent } from './map/map.component';
import { LoaderService } from './loader.service';
import { ParcoordsComponent } from './parcoords/parcoords.component';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatInputModule } from '@angular/material/input'
import { MatNativeDateModule } from '@angular/material/core'
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OverviewComponent } from './overview/overview.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AboutComponent } from './about/about.component';
import { ScatterplotComponent } from './scatterplot/scatterplot.component'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { LegendComponent } from './legend/legend.component';
import { PerformanceComponent } from './performance/performance.component';
import { PerfChartComponent } from './perf-chart/perf-chart.component';
import { EconChartComponent } from './econ-chart/econ-chart.component';
import { PredictChartComponent } from './predict-chart/predict-chart.component';
import { AnalyticsConfComponent } from './analytics-conf/analytics-conf.component';
import { AnalyticsMapComponent } from './analytics-map/analytics-map.component';
import { AnalyticsLoaderService } from './analytics-loader.service';
import { OtherChartComponent } from './other-chart/other-chart.component';
import { RatioComponent } from './ratio/ratio.component';

@NgModule({
  declarations: [
    AppComponent,
    FirstChartComponent,
    SecondChartComponent,
    MedalChartComponent,
    MedalProgressionChartComponent,
    ConfComponent,
    MedalRegionChartComponent,
    MapComponent,
    ParcoordsComponent,
    OverviewComponent,
    AnalyticsComponent,
    AboutComponent,
    ScatterplotComponent,
    LegendComponent,
    PerformanceComponent,
    PerfChartComponent,
    EconChartComponent,
    PredictChartComponent,
    AnalyticsConfComponent,
    AnalyticsMapComponent,
    OtherChartComponent,
    RatioComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSliderModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule

  ],
  providers: [
    DataService,
    LoaderService,
    AnalyticsLoaderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(){
  }
}
