import { Injectable } from '@angular/core';
import PCA from 'pca-js';
import { PCAEntry, PcaQuery } from 'src/data/data';
import { ObjectUnsubscribedError, of, Subscription } from 'rxjs';
import * as mjs from 'mathjs'
import { LoaderService } from './loader.service';
import { DataService } from './data.service';
@Injectable({
  providedIn: 'root'
})
export class PcaService {

  private filteredLines = []
  subscription: Subscription;

  eventsPerSport = {}

  constructor(private dataService: DataService) {
    this.subscription = this.dataService.eventsPerSportDataMessage.subscribe(message => this.eventsPerSport = message)
  }

  shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

  aggregateData(lines, isNormalize: boolean, medals){
    let aggregateLines = []
    let medalSum = {}
    let gold = ""
    let silver = ""
    let bronze = ""
    if (!medals[0].isChecked){
      gold = "Gold"
    }
    if (!medals[1].isChecked){
      silver = "Silver"
    }
    if (!medals[2].isChecked){
      bronze = "Bronze"
    }
    let goldWeigth = medals[0].weight
    let silverWeight = medals[1].weight
    let bronzeWeight = medals[2].weight
    
    for (const elem in lines){
      if (lines[elem].Medal !== "NA" && lines[elem].Medal !== gold && lines[elem].Medal !== silver && lines[elem].Medal !== bronze ){
        let currentNOC = lines[elem].NOC_value
        let currentYear = lines[elem].Year
        let currentSport = lines[elem].Sport_value
        let currentSportName = lines[elem].Sport
        let currentMedaltype = lines[elem].Medal
        let weight = 1
        if (currentMedaltype === "Gold"){
          weight = goldWeigth
        }
        if (currentMedaltype === "Silver"){
          weight = silverWeight
        }
        if (currentMedaltype === "Bronze"){
          weight = bronzeWeight
        }
        if(currentNOC) {
          if(medalSum[currentNOC]){
            if(medalSum[currentNOC][currentYear]){
              if(medalSum[currentNOC][currentYear][currentSport]){
                medalSum[currentNOC][currentYear][currentSport].totalMedals+=weight
              }else{
                medalSum[currentNOC][currentYear][currentSport]={
                  totalMedals: weight,
                  sportName: currentSportName
                }
              }
            } else {
              medalSum[currentNOC][currentYear]={}
              if(medalSum[currentNOC][currentYear][currentSport]){
                medalSum[currentNOC][currentYear][currentSport].totalMedals+=weight
              }else{
                medalSum[currentNOC][currentYear][currentSport]={
                  totalMedals: weight,
                  sportName: currentSportName
                }
              }
            }          
          } else {
            medalSum[currentNOC]={}
            if(medalSum[currentNOC][currentYear]){
              if(medalSum[currentNOC][currentYear][currentSport]){
                medalSum[currentNOC][currentYear][currentSport].totalMedals+=weight
              }else{
                medalSum[currentNOC][currentYear][currentSport]={
                  totalMedals: weight,
                  sportName: currentSportName
                }
              }
            } else {
              medalSum[currentNOC][currentYear]={}
              if(medalSum[currentNOC][currentYear][currentSport]){
                medalSum[currentNOC][currentYear][currentSport].totalMedals+=weight
              }else{
                medalSum[currentNOC][currentYear][currentSport]={
                  totalMedals: weight,
                  sportName: currentSportName
                }
              }
            }     
          }
        }
      }
    }
    Object.keys(medalSum).forEach( noc => {
      Object.keys(medalSum[noc]).forEach(year => {
        Object.keys(medalSum[noc][year]).forEach(sport => {
          if(isNormalize){
            let eventsAmount = 1
            let currentSportName = medalSum[noc][year][sport].sportName
            this.eventsPerSport[Number(year)] && this.eventsPerSport[year][currentSportName] && (eventsAmount = this.eventsPerSport[year][currentSportName])
            medalSum[noc][year][sport].totalMedals/=eventsAmount   
          }   
          aggregateLines.push([Number(noc),Number(year),Number(sport),medalSum[noc][year][sport].totalMedals])          
        })        
      })
    })
    console.log("aggregatelines", aggregateLines)
    return aggregateLines
  }

  filterData(q: PcaQuery, lines: any[]) {

    let resLines
    this.filteredLines = lines
    if(q.selectedNocs.length > 0) {
      this.filteredLines = this.filteredLines.filter(l => q.selectedNocs.includes(l.NOC))    
    }

    if(q.selectedSports.length > 0) {
      this.filteredLines = this.filteredLines.filter(l => q.selectedSports.includes(l.Sport))    
    }

    this.filteredLines = this.filteredLines.filter(l => (l.Year >= q.start && l.Year <= q.end)) 
    
// q.medals[0].weight
    resLines = this.aggregateData(this.filteredLines, q.isNormalize, q.medals)
    
    resLines = this.normalizeLines(resLines)

    return resLines
  }

  normalizeLines(data: any[]): any[] {
    let mt = PCA.transpose(data)
    let newColumns = []
    mt.forEach(column => {
      let mean = mjs.mean(column)
      let standardDeviation = mjs.std(column)
      newColumns.push(column.map(i => (i-mean)/standardDeviation))
    });
    newColumns = PCA.transpose(newColumns)
    return newColumns
  }

  async computePca(q: PcaQuery, lines: any[]): Promise<PCAEntry[]> {
    let data = this.filterData(q, lines)
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
        details: this.filteredLines[i]
      }
      return r
    })
    console.log("pcaresult", result)
    return result
    // return []
  }
}
