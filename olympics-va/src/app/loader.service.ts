import { Injectable, NgModule, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { ObjectUnsubscribedError, of, Subscription } from 'rxjs';
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

  countries = {}

  private isOlympicsDataReady: Boolean = false

  constructor(private dataService: DataService) {
    this.subscription = this.dataService.olympycsReadinessMessage.subscribe(message => this.isOlympicsDataReady = message)
    this.selectedSportsSub = this.dataService.selectedSportsMessage.subscribe(message => this.selectedSports = message)
    this.loadOlympicsResults()
  }


  async loadNocCsv() {
    let lines = await d3.csv("/assets/data/noc_regions.csv")
    let countries = []
    lines.forEach(l => {
      countries[l.NOC] = {
        continent: l.continent,
        name: l.region,
        NOC: l.NOC
      }
    })
    return countries
  }

  async loadOlympicsCsv() {
    let lines = await d3.csv("/assets/data/athlete_events.csv")
    let res = this.computeMedalsByNation(lines, this)
    return res
  }

  checkReadiness(noc_r:boolean, oly_r:boolean) {
    if(noc_r && oly_r) {
      this.isOlympicsDataReady = true
      this.dataService.onOlympicsDataReady(this.isOlympicsDataReady)
    }
  }


  loadOlympicsResults(): void {
    console.log("loading olympics results")
    let rowData = []
    let c = this

    let noc_r, oly_r = false

    this.loadNocCsv().then(data => {
      this.countries = data
      noc_r = true
      this.checkReadiness(noc_r, oly_r)
    })

    this.loadOlympicsCsv().then(d => {
      this.olympicsDict["NOC"] = d
      oly_r = true
      this.checkReadiness(noc_r, oly_r)
    })

    // let data = await d3.csv("/assets/data/athlete_events.csv")
    /*d3.csv("/assets/data/athlete_events.csv").then(function (data) {
      rowData = data
    }).then(() => {
      let res = this.computeMedalsByNation(rowData)
      this.olympicsDict["NOC"] = res
      this.isOlympicsDataReady = true
      this.dataService.onOlympicsDataReady(this.isOlympicsDataReady)
    })
*/
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

  computeMedalsByNation(data, c) {
    let res: any = {}
    let sports = c.computeSportsList(data)
    data.forEach(line => {
      let yearMap = res[line.Year] || {}
      let team = yearMap[line.NOC]
      if (!team) {
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
      if (res[year][nation] != undefined) {
        totgolds += res[year][nation].golds
        totsilvers += res[year][nation].silvers
        totbronzes += res[year][nation].bronzes
      }
    }
    console.log(totgolds + totsilvers + totbronzes)
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
    let maxSingleSport = 0
    for (let i = start; i <= end; i++) {
      let currentYear = dict[i]
      currentYear && Object.keys(currentYear).forEach(noc => {
        let data = currentYear[noc]
        let teamStats = res[noc]

        selectedSports.forEach(sport => {
          if (data.sports[sport]) {
            if (!teamStats) {
              teamStats = {
                name: noc,
                golds: 0,
                bronzes: 0,
                silvers: 0,
                total: 0
              }
            }
            let teamSportStats = teamStats[sport]
            if (!teamSportStats) {
              teamSportStats = {
                golds: 0,
                bronzes: 0,
                silvers: 0,
                total: 0
              }
            }

            medals.includes(golds) && (teamSportStats.golds += data.sports[sport].golds)
            medals.includes(bronzes) && (teamSportStats.bronzes += data.sports[sport].bronzes)
            medals.includes(silvers) && (teamSportStats.silvers += data.sports[sport].silvers)
            medals.includes(golds) && (teamStats.golds += data.sports[sport].golds)
            medals.includes(bronzes) && (teamStats.bronzes += data.sports[sport].bronzes)
            medals.includes(silvers) && (teamStats.silvers += data.sports[sport].silvers)
            teamStats.total = teamStats.golds + teamStats.bronzes + teamStats.silvers
            teamSportStats.total = teamSportStats.golds + teamSportStats.bronzes + teamSportStats.silvers
            max = teamStats.total > max ? teamStats.total : max
            maxSingleSport = teamSportStats.total > maxSingleSport ? teamSportStats.total : maxSingleSport
            teamStats[sport] = teamSportStats
            res[noc] = teamStats
          }
        })
      })
    }
    return [res, max as number, maxSingleSport as number]
  }

}
