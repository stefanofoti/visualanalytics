import { Injectable, NgModule, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { bronzes, golds, silvers } from 'src/data/data';
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
      let yearMap = res[line.Year] || {}
      let team = yearMap[line.NOC]
      if(!team) {
        team = {
          name: line.NOC,
          golds: 0,
          bronzes: 0,
          silvers: 0,
          year: line.Year
        }
      }
      line.Medal === "Gold" && team.golds++
      line.Medal === "Silver" && team.silvers++
      line.Medal === "Bronze" && team.bronzes++
      yearMap[line.NOC] = team
      res[line.Year] = yearMap
    });
    return res
  }

  computeMedalsByNationInRange(start: number, end: number, medals: string[]) {
    let dict = this.olympicsDict["NOC"]
    let res = {}
    let max = 0
    for (let i = start; i<=end; i++) {
      let currentYear = dict[i]
      currentYear && Object.keys(currentYear).forEach(noc => {
        let teamStats = res[noc]
        if(!teamStats) {
          teamStats = {
            name: noc,
            golds: 0,
            bronzes: 0,
            silvers: 0,
            total: 0
          }
        }
        medals.includes(golds) && (teamStats.golds += currentYear[noc].golds)
        medals.includes(bronzes) && (teamStats.bronzes += currentYear[noc].bronzes)
        medals.includes(silvers) && (teamStats.silvers += currentYear[noc].silvers)
        teamStats.total = teamStats.golds + teamStats.bronzes + teamStats.silvers
        max = teamStats.total > max ? teamStats.total : max
        res[noc] = teamStats
      })
    }
    return [res, max]
  }

}
