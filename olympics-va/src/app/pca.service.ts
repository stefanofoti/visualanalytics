import { Injectable } from '@angular/core';
import PCA from 'pca-js';
import { CountryGdp, PCAEntry, PcaQuery } from 'src/data/data';
import { ObjectUnsubscribedError, of, Subscription } from 'rxjs';
import * as mjs from 'mathjs'
import { LoaderService } from './loader.service';
import { DataService } from './data.service';
import { filter } from 'mathjs';
@Injectable({
  providedIn: 'root'
})
export class PcaService {

  private filteredLines = []
  eventsPerSport = {}
  avgGdp = {}
  avgPop = {}
  PCADetails = []
  TradNocs=[]

  constructor(private dataService: DataService, private loaderService: LoaderService) {
    this.dataService.eventsPerSportDataMessage.subscribe(message => {
      this.eventsPerSport = message
    })
    this.dataService.avgGdpPopMessage.subscribe(message => {
      this.avgGdp = message[0]
      this.avgPop = message[1]
    })
  }

  shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
  computePCATradition(){

  }

  aggregateData(lines, isNormalize: boolean, isTradition:boolean, end: number, isGdp: boolean, isPop: boolean, medals) {



    let aggregateLines = []
    let medalSum = {}
    let gold = ""
    let silver = ""
    let bronze = ""
    if (!medals[0].isChecked) {
      gold = "Gold"
    }
    if (!medals[1].isChecked) {
      silver = "Silver"
    }
    if (!medals[2].isChecked) {
      bronze = "Bronze"
    }
    let goldWeigth = medals[0].weight
    let silverWeight = medals[1].weight
    let bronzeWeight = medals[2].weight

    this.PCADetails = []

    for (const elem in lines) {
      if (lines[elem].Medal !== "NA" && lines[elem].Medal !== gold && lines[elem].Medal !== silver && lines[elem].Medal !== bronze) {
        let currentNOC = Number(lines[elem].NOC_value)
        let currentNOCName = lines[elem].NOC
        let currentYear = Number(lines[elem].Year)
        let currentSport = Number(lines[elem].Sport_value)
        let currentSportName = lines[elem].Sport || ""
        let currentMedaltype = lines[elem].Medal
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
        if (currentNOC) {
          if (medalSum[currentNOC]) {
            if (medalSum[currentNOC][currentYear]) {
              if (medalSum[currentNOC][currentYear][currentSport]) {
                medalSum[currentNOC][currentYear][currentSport].totalMedals += (isTradition? weight*Math.pow(100, 1 / (end - currentYear + 1)) :  weight)
              } else {
                medalSum[currentNOC][currentYear][currentSport] = {
                  totalMedals: isTradition? weight*Math.pow(100, 1 / (end - currentYear + 1)) :  weight,
                  sportName: currentSportName
                }
              }
            } else {
              medalSum[currentNOC][currentYear] = {}
              if (medalSum[currentNOC][currentYear][currentSport]) {
                medalSum[currentNOC][currentYear][currentSport].totalMedals += (isTradition? weight*Math.pow(100, 1 / (end - currentYear + 1)) :  weight)
              } else {
                medalSum[currentNOC][currentYear][currentSport] = {
                  totalMedals: isTradition? weight*Math.pow(100, 1 / (end - currentYear + 1)) :  weight,
                  sportName: currentSportName
                }
              }
            }
          } else {
            medalSum[currentNOC] = {
              noc: currentNOCName
            }
            if (medalSum[currentNOC][currentYear]) {
              if (medalSum[currentNOC][currentYear][currentSport]) {
                medalSum[currentNOC][currentYear][currentSport].totalMedals += (isTradition? weight*Math.pow(100, 1 / (end - currentYear + 1)) :  weight)
              } else {
                medalSum[currentNOC][currentYear][currentSport] = {
                  totalMedals: isTradition? weight*Math.pow(100, 1 / (end - currentYear + 1)) :  weight,
                  sportName: currentSportName
                }
              }
            } else {
              medalSum[currentNOC][currentYear] = {}
              if (medalSum[currentNOC][currentYear][currentSport]) {
                medalSum[currentNOC][currentYear][currentSport].totalMedals += (isTradition? weight*Math.pow(100, 1 / (end - currentYear + 1)) :  weight)
              } else {
                medalSum[currentNOC][currentYear][currentSport] = {
                  totalMedals: isTradition? weight*Math.pow(100, 1 / (end - currentYear + 1)) :  weight,
                  sportName: currentSportName
                }
              }
            }
          }
        }
      }
    }
    Object.keys(medalSum).forEach(noc => {
      let gdpDict = this.loaderService.gdp
      let gdpEntry: CountryGdp = gdpDict[noc]
      let nocName = medalSum[noc].noc

      Object.keys(medalSum[noc]).forEach(year => {
        if (!isNaN(Number(year))) {



          let val

          if (isPop) {
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
            if (isNormalize && medalSum[noc][year]) {
              let eventsAmount = 1
              let currentSportName = medalSum[noc][year][sport].sportName
              this.eventsPerSport[Number(year)] && this.eventsPerSport[year][currentSportName] && (eventsAmount = this.eventsPerSport[year][currentSportName])
              medalSum[noc][year][sport].totalMedals /= eventsAmount
            }
            let population
            if (isPop) {
              this.loaderService.populations[this.loaderService.countries[nocName].name] && this.loaderService.populations[this.loaderService.countries[nocName].name].years[val] && (population = this.loaderService.populations[this.loaderService.countries[nocName].name].years[val])
              !population && (population = this.avgPop[this.loaderService.countries[nocName].name])
              population > 0 && (medalSum[noc][year][sport].totalMedals /= population)
              if (population == 0 || !population) {
                medalSum[noc][year] = undefined
              }
            }
            let gdp
            if (isGdp) {
              this.loaderService.gdp[nocName] && this.loaderService.gdp[nocName].years[Number(year)] && (gdp = this.loaderService.gdp[nocName].years[Number(year)])
              !gdp && (gdp = this.avgGdp[nocName]) 
              gdp > 0 && (medalSum[noc][year][sport].totalMedals /= gdp)
              if (gdp == 0 || !gdp) {
                medalSum[noc][year] = undefined
              }
            }            
            medalSum[noc][year] && this.PCADetails.push({
              NOC: nocName,
              Year: year,
              Sport: medalSum[noc][year][sport].sportName,
              Totmedals: medalSum[noc][year][sport].totalMedals,
              Gdp: gdp,
              Pop: population
            })
            medalSum[noc][year] && aggregateLines.push([Number(noc), Number(year), Number(sport), medalSum[noc][year][sport].totalMedals])
          })
        }
      })
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

    
    // q.medals[0].weight

    resLines = this.aggregateData(this.filteredLines, q.isNormalize, q.isTradition, q.end, q.isGdp, q.isPop, q.medals)

    resLines.length > 0 && (resLines = this.normalizeLines(resLines))

    // resLines.filter(l => !isNaN(l[0]) && !isNaN(l[1]) && !isNaN(l[2]) && !isNaN(l[3]))

    return resLines
  }

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

  async computePca(q: PcaQuery, lines: any[]): Promise<PCAEntry[]> {
    let data = this.filterData(q, lines)
    if(data.length <= 0){
      return []
    }
    console.log("data", data)

    // var data = [[40,50,60,20,70],[50,70,60,25,90],[80,70,90,30,60],[50,60,80,50,50]];
    var vectors = PCA.getEigenVectors(data);
    let m = [vectors[0].vector, vectors[1].vector, vectors[2].vector]
    let mt = PCA.transpose(m)
    //let adjData = PCA.computeAdjustedData(data, vectors)
    // console.log(adjData)
    let components = PCA.multiply(data, mt)
    console.log(components)
    console.log("components", components)
    let result = components.map((c, i) => {
      let r: PCAEntry = {
        x: c[0],
        y: c[1],
        z: c[2],
        details: this.PCADetails[i]
      }
      return r
    })
    console.log("pcaresult", result)
    return result
    // return []
  }
}
