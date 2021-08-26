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
      this.olympicsDict["nations"] = res
      this.isOlympicsDataReady = true
      this.dataService.onOlympicsDataReady(this.isOlympicsDataReady)
    })

  }

  computeMedalsByNation(data) {
    let res: any = {}
    data.forEach(line => {
      let team = res[line.Team]
      if(!team) {
        team = {
          name: line.Team,
          golds: 0,
          bronze: 0,
          silver: 0
        }
      }
      line.Medal === "Bronze" && team.golds++
      line.Medal === "Gold" && team.bronze++
      line.Medal === "Silver" && team.silver++

      res[line.Team] = team
    });
    return res
  }

}
