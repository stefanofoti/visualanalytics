import { Injectable, NgModule, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { bronzes, golds, silvers } from 'src/data/data';
import { DataService } from './data.service';
import * as ld from "lodash";

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
  
  computeSportsList(data) {
    let res: any = {}
    data.forEach(line => {
      let sport = line.Event
      if (!res[sport]) {
        res[sport] = {
          golds: 0,
          silvers: 0,
          bronzes: 0
        }
      }
    })
    console.log(res)
    return res
  }

  computeMedalsByNation(data) {
    let res: any = {}
    let sports = this.computeSportsList(data)
    data.forEach(line => {
      let yearMap = res[line.Year] || {}
      let team = yearMap[line.NOC]
      if(!team) {
        let sportsCP = ld.cloneDeep(sports)
        team = {
          name: line.NOC,
          golds: 0,
          silvers: 0,
          bronzes: 0,
          sports: sportsCP,
          year: line.Year
        }
      }
      if (line.Medal === "Gold") {
        if (team.sports[line.Event].golds === 0) {
          team.sports[line.Event].golds++
          team.golds++
        }
      }
      if (line.Medal === "Silver") {
        if (team.sports[line.Event].silvers === 0) {
          team.sports[line.Event].silvers++
          team.silvers++
        }
      }
      if (line.Medal === "Bronze") {
        if (team.sports[line.Event].bronzes === 0) {
          team.sports[line.Event].bronzes++
          team.bronzes++
        }
      }
      yearMap[line.NOC] = team
      res[line.Year] = yearMap
    });
    console.log(res)
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
