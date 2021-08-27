import { Injectable, NgModule, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  public olympicsDict: any = {}
  subscription: Subscription;
  private isOlympicsDataReady: Boolean = false

  constructor(private dataService: DataService) {
    this.subscription = this.dataService.olympycsReadinessMessage.subscribe(message => this.isOlympicsDataReady = message)
    this.loadOlympicsResults()
  }

  loadOlympicsResults(): void {
    console.log("loading olympics results")
    let rowData = []
    d3.csv("/assets/data/athlete_events.csv").then(function (data) {
      rowData = data
    }).then(() => {
      let res = this.computeMedalsByNation(rowData)
      this.olympicsDict["NOC"] = res
      this.isOlympicsDataReady = true
      this.dataService.onOlympicsDataReady(this.isOlympicsDataReady)
    })

  }

  computeMedalsByNation(data) {
    let res: any = {}
    data.forEach(line => {
      let team = res[line.NOC]
      if(!team) {
        team = {
          name: line.NOC,
          golds: 0,
          bronze: 0,
          silver: 0
        }
      }
      line.Medal === "Gold" && team.golds++
      line.Medal === "Silver" && team.silver++
      line.Medal === "Bronze" && team.bronze++

      res[line.NOC] = team
    });
    return res
  }

}
