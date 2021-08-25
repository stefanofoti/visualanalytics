import { Injectable, NgModule, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  public data: any[] = []
  subscription: Subscription;
  private isOlympicsDataReady: Boolean = false

  constructor(private dataService: DataService) {
    this.subscription = this.dataService.olympycsReadinessMessage.subscribe(message => this.isOlympicsDataReady = message)
    this.loadOlympicsResults()
  }

  loadOlympicsResults(): void {
    console.log("loading olympics results")
    let d: any[] = []
    d3.csv("/assets/data/population.csv").then(function (data) {
      d = data
    })
    this.data.push(d)
    this.isOlympicsDataReady = true
    this.dataService.onOlympicsDataReady(this.isOlympicsDataReady)

  }
}
