import { Injectable, NgModule, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { ObjectUnsubscribedError, Subscription } from 'rxjs';
import { bronzes, golds, PreCheckedSports2, PreCheckedSports, silvers, Sport } from 'src/data/data';
import { DataService } from './data.service';
import * as ld from "lodash";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  public olympicsDict: any = {}
  subscription: Subscription;
  selectedSportsSub: Subscription;

  selectedSports: Sport[]

  private isOlympicsDataReady: Boolean = false

  constructor(private dataService: DataService) {
    this.subscription = this.dataService.olympycsReadinessMessage.subscribe(message => this.isOlympicsDataReady = message)
    this.selectedSportsSub = this.dataService.selectedSportsMessage.subscribe(message => this.selectedSports = message)
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
    this.selectedSports = []
    data.forEach(line => {
      let sport = line.Event
      if (!res[sport]) {
        res[sport] = {
          golds: 0,
          silvers: 0,
          bronzes: 0
        }
        this.selectedSports.push({
          id: this.selectedSports.length,
          isChecked: PreCheckedSports.includes(sport),
          name: sport,
          group: line.Sport
        })
      }
    })
    console.log(res)
    this.dataService.onSportsDataReady(this.selectedSports)
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
    var totgolds = 0
    var totsilvers = 0
    var totbronzes = 0
    var nation = "FRA"
    for (const year in res) {
      if (res[year][nation] != undefined){
        totgolds += res[year][nation].golds
        totsilvers += res[year][nation].silvers
        totbronzes += res[year][nation].bronzes
      }      
    }
    console.log(totgolds+totsilvers+totbronzes)
    console.log(res)

    return res
  }

  computeMedalsByNationInRange(start: number, end: number, medals: string[], selectedSports: string[]) {
    console.log("computeMedalsByNationInRange sports: " + selectedSports.length)
    if (selectedSports.length == 0) {
      selectedSports = PreCheckedSports2 
    }
    let dict = this.olympicsDict["NOC"]
    let res = {}
    let max = 0
    for (let i = start; i<=end; i++) {
      let currentYear = dict[i]
      currentYear && Object.keys(currentYear).forEach(noc => {
        let data = currentYear[noc]
        let teamStats = res[noc]

        selectedSports.forEach(sport => {
          if(data.sports[sport]) {
            if(!teamStats) {
              teamStats = {
                name: noc,
                golds: 0,
                bronzes: 0,
                silvers: 0,
                total: 0
              }
            }
            medals.includes(golds) && (teamStats.golds += data.sports[sport].golds)
            medals.includes(bronzes) && (teamStats.bronzes += data.sports[sport].bronzes)
            medals.includes(silvers) && (teamStats.silvers += data.sports[sport].silvers)
            teamStats.total = teamStats.golds + teamStats.bronzes + teamStats.silvers
            max = teamStats.total > max ? teamStats.total : max
            res[noc] = teamStats        
          }
        })
      })
    }
    return [res, max]
  }

}
