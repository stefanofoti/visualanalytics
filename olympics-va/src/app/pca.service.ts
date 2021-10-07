import { Injectable } from '@angular/core';
import PCA from 'pca-js';
import { CountryGdp, PCAEntry, PcaQuery } from 'src/data/data';
import * as hash from 'object-hash'
import * as mjs from 'mathjs'
import { LoaderService } from './loader.service';
import { DataService } from './data.service';
import { e, filter } from 'mathjs';
import * as ld from "lodash";

@Injectable({
  providedIn: 'root'
})
export class PcaService {

  private filteredLines = []
  eventsPerSport = {}
  avgGdp = {}
  avgPop = {}
  PCADetails = []
  TradNocs = []

  constructor(private dataService: DataService, private loaderService: LoaderService) {
    this.dataService.eventsPerSportDataMessage.subscribe(message => {
      this.eventsPerSport = message
    })
    this.dataService.avgGdpPopMessage.subscribe(message => {
      this.avgGdp = message[0]
      this.avgPop = message[1]
    })
  }

  aggregateData(lines, q: PcaQuery) {



    let aggregateLines = []
    let medalSum = {}
    let gold = ""
    let silver = ""
    let bronze = ""

    if (!q.medals[0].isChecked) {
      gold = "Gold"
    }
    if (!q.medals[1].isChecked) {
      silver = "Silver"
    }
    if (!q.medals[2].isChecked) {
      bronze = "Bronze"
    }
    let goldWeigth = q.medals[0].weight
    let silverWeight = q.medals[1].weight
    let bronzeWeight = q.medals[2].weight

    this.PCADetails = []

    for (const elem in lines) {
      if (lines[elem].Medal !== "NA" && lines[elem].Medal !== gold && lines[elem].Medal !== silver && lines[elem].Medal !== bronze) {
        let currentNOC = Number(lines[elem].NOC_value)
        let currentNOCName = lines[elem].NOC
        let currentEventName = lines[elem].Event
        let currentYear = Number(lines[elem].Year)
        let currentSport = Number(lines[elem].Sport_value)
        let currentSportName = lines[elem].Sport || ""
        let currentMedaltype = lines[elem].Medal
        let currentSex = lines[elem].Sex_value
        let weight = 1
        if (currentMedaltype === "Gold") {
          weight = goldWeigth
        }
        if (currentMedaltype === "Silver") {
          weight = silverWeight
        }
        if (currentMedaltype === "Bronze") {
          weight = bronzeWeight
        }
        let medal = {
          event: currentEventName,
          type: currentMedaltype
        }
        if (currentNOC) {
          if (medalSum[currentNOC]) {
            if (medalSum[currentNOC][currentYear]) {
              if (medalSum[currentNOC][currentYear][currentSport]) {
                if (medalSum[currentNOC][currentYear][currentSport][currentSex]) {

                  let medals: [] = medalSum[currentNOC][currentYear][currentSport][currentSex].medals

                  let res = medals.find(m => (m as any).event === medal.event && (m as any).type === medal.type)
                  if (!res) {
                    medalSum[currentNOC][currentYear][currentSport][currentSex].totalMedals += (q.isTradition ? weight * Math.pow(100, 1 / (q.end - currentYear + 1)) : weight)
                    medalSum[currentNOC][currentYear][currentSport][currentSex].medals.push(medal)
                  }
                }
                else {
                  medalSum[currentNOC][currentYear][currentSport][currentSex] = {
                    totalMedals: q.isTradition ? weight * Math.pow(100, 1 / (q.end - currentYear + 1)) : weight,
                    sportName: currentSportName
                  }
                  medalSum[currentNOC][currentYear][currentSport][currentSex].medals = [medal]
                }
              } else {
                medalSum[currentNOC][currentYear][currentSport] = {}
                medalSum[currentNOC][currentYear][currentSport][currentSex] = {
                  totalMedals: q.isTradition ? weight * Math.pow(100, 1 / (q.end - currentYear + 1)) : weight,
                  sportName: currentSportName
                }
                medalSum[currentNOC][currentYear][currentSport][currentSex].medals = [medal]
              }
            } else {
              medalSum[currentNOC][currentYear] = {}
              medalSum[currentNOC][currentYear][currentSport] = {}
              medalSum[currentNOC][currentYear][currentSport][currentSex] = {
                totalMedals: q.isTradition ? weight * Math.pow(100, 1 / (q.end - currentYear + 1)) : weight,
                sportName: currentSportName
              }
              medalSum[currentNOC][currentYear][currentSport][currentSex].medals = [medal]

            }
          } else {
            medalSum[currentNOC] = {
              noc: currentNOCName
            }
            medalSum[currentNOC][currentYear] = {}
            medalSum[currentNOC][currentYear][currentSport] = {}
            medalSum[currentNOC][currentYear][currentSport][currentSex] = {
              totalMedals: q.isTradition ? weight * Math.pow(100, 1 / (q.end - currentYear + 1)) : weight,
              sportName: currentSportName
            }
            medalSum[currentNOC][currentYear][currentSport][currentSex].medals = [medal]
          }
        }
      }
    }
    Object.keys(medalSum).forEach(noc => {
      let nocName = medalSum[noc].noc

      Object.keys(medalSum[noc]).forEach(year => {
        if (!isNaN(Number(year))) {
          let val

          if (q.isPop) {
            if (Number(year) <= 1900) {
              val = 1900
            } else {
              if (Number(year) % 10 <= 5) {
                val = Number(year) - Number(year) % 10
              }
              else {
                val = Number(year) + 10 - Number(year) % 10
              }
            }
          }
          Object.keys(medalSum[noc][year]).forEach(sport => {
            medalSum[noc][year] && Object.keys(medalSum[noc][year][sport]).forEach(sex => {
              if (q.isNormalize && medalSum[noc][year]) {
                let eventsAmount = 1
                let currentSportName = medalSum[noc][year][sport][sex].sportName
                this.eventsPerSport[Number(year)] && this.eventsPerSport[year][currentSportName] && (eventsAmount = this.eventsPerSport[year][currentSportName])
                if (medalSum[noc][year][sport][sex].sportName == "Swimming" && year == "2016"){
                  console.log("check total number of events:", medalSum[noc][year][sport][sex].totalMedals, eventsAmount)
                }
                medalSum[noc][year][sport][sex].totalMedals /= eventsAmount
              }
              let population
              if (q.isPop) {
                this.loaderService.populations[this.loaderService.countries[nocName].name] && this.loaderService.populations[this.loaderService.countries[nocName].name].years[val] && (population = this.loaderService.populations[this.loaderService.countries[nocName].name].years[val])
                !population && (population = this.avgPop[this.loaderService.countries[nocName].name])
                population > 0 && (medalSum[noc][year][sport][sex].totalMedals /= population)
                if (population == 0 || !population) {
                  medalSum[noc][year] = undefined
                }
              }
              let gdp
              if (q.isGdp) {
                this.loaderService.gdp[nocName] && this.loaderService.gdp[nocName].years[Number(year)] && (gdp = this.loaderService.gdp[nocName].years[Number(year)])
                !gdp && (gdp = this.avgGdp[nocName])
                gdp > 0 && (medalSum[noc][year][sport][sex].totalMedals /= gdp)
                if (gdp == 0 || !gdp) {
                  medalSum[noc][year] = undefined
                }
              }
              medalSum[noc][year] && this.PCADetails.push({
                NOC: nocName,
                Year: year,
                Sport: medalSum[noc][year][sport][sex].sportName,
                Totmedals: medalSum[noc][year][sport][sex].totalMedals,
                Gdp: gdp,
                Pop: population,
                Sex: Number(sex) == 0 ? "M" : "F"
              })
              medalSum[noc][year] && aggregateLines.push([Number(noc), Number(year), Number(sport), Number(sex), medalSum[noc][year][sport][sex].totalMedals])
            })
          })
        }
      })
    })

    let removeNocs: Number
    let removeSports: Number
    let removeSex: Number
    let removeArray = []

    if (q.selectedNocs.length == 1) {
      removeNocs = 0
      removeArray.push(removeNocs)
    }
    if (q.selectedSports.length == 1) {
      removeSports = 2
      removeArray.push(removeSports)
    }
    if (!q.isMale || !q.isFemale) {
      removeSex = 3
      removeArray.push(removeSex)
    }

    aggregateLines.forEach(line => {
      for (let i = removeArray.length - 1; i >= 0; i--) {
        line.splice(removeArray[i], 1);
      }
    })

    console.log("details lines", this.PCADetails)
    console.log("aggregatelines", aggregateLines)
    return aggregateLines
  }

  filterData(q: PcaQuery, lines: any[]) {

    let resLines: any[]
    this.filteredLines = lines
    if (q.selectedNocs.length > 0) {
      this.filteredLines = this.filteredLines.filter(l => q.selectedNocs.includes(l.NOC))
    }

    if (q.selectedSports.length > 0) {
      this.filteredLines = this.filteredLines.filter(l => q.selectedSports.includes(l.Sport))
    }

    this.filteredLines = this.filteredLines.filter(l => (l.Year >= q.start && l.Year <= q.end))

    this.filteredLines = this.filteredLines.filter(l => {
      if (q.isMale && q.isFemale) {
        return (l.Sex === "M" || l.Sex === "F")
      }
      if (q.isFemale) {
        return l.Sex === "F"
      }
      if (q.isMale) {
        return l.Sex === "M"
      }
      return false
    })

    // this.filteredLines = this.removeGroupSports(this.filteredLines)

    resLines = this.aggregateData(this.filteredLines, q) //q.isNormalize, q.isTradition, q.end, q.isGdp, q.isPop, q.medals
    resLines.length > 0 && (resLines = this.normalizeLines(resLines))

    return resLines
  }

  /*removeGroupSports(lines: any[]) {


    return []
  }*/

  normalizeLines(data: any[]): any[] {
    let mt = PCA.transpose(data)
    let newColumns = []
    mt.forEach(column => {
      let mean = mjs.mean(column)
      let standardDeviation = mjs.std(column)
      newColumns.push(column.map(i => (i - mean) / standardDeviation))
    });
    newColumns = PCA.transpose(newColumns)
    return newColumns
  }

  getCacheId(q: PcaQuery) {
    let queryId = "pca-" + hash(q)
    return queryId
  }

  async computePca(q: PcaQuery, lines: any[]): Promise<PCAEntry[]> {

    let pcaId = this.getCacheId(q)
    let cacheValue = JSON.parse(localStorage.getItem(pcaId))
    if (cacheValue) {
      this.dataService.pcaDataReady(cacheValue)
      return cacheValue
    }

    let data = this.filterData(q, lines)
    if (data.length <= 0) {

      let result: PCAEntry[] = q.selectedNocs.map(n => {
        return {
          x: 0,
          y: 0,
          z: 0,
          details: {
            NOC: n,
            Year: "0",
            Sport: " - ",
            Totmedals: 0,
            Sex: " - "
          }
        }
      })

      this.dataService.pcaDataReady(result)
      return result
    }



    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./pca.worker', import.meta.url));

      worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
        let components = data
        console.log(components)
        console.log("components", components)
        let result = components.map((c, i) => {
          let r: PCAEntry = {
            x: c[0],
            y: c[1],
            details: this.PCADetails[i]
          }
          r.z = c[2] && c[2] || 0
          return r
        })
        console.log("pcaresult", result)
        // return result

        let x: PCAEntry[] = result
        console.log("plotting pca: sending readiness...", x)
        try {
          localStorage.setItem(pcaId, JSON.stringify(result));          
        } catch (error) {
          console.log(error)
        }
        this.dataService.pcaDataReady(x)
        worker.terminate()

      };

      worker.postMessage(data)
    } else {
      alert("PCA not supported")
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
    return []
  }
}
