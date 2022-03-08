import { Injectable } from '@angular/core';
import { ObjectUnsubscribedError, of, Subscription } from 'rxjs';
import * as ld from "lodash";
import * as d3 from 'd3';
import { forEach, number } from 'mathjs';
import { DataService } from './data.service';
import { NocsList } from 'src/data/data';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsLoaderService {

  public performanceDict: any = {}
  public economicDict: any = {}
  public medalsDict: any = {}
  public boxPlotDict: any = {}
  public boxPlotOutliers: any = {}
  public economicBoxPlotDict: any = {}
  public economicBoxPlotOutliers: any = {}
  public q: any = {}
  public NocsList = NocsList

  private unloaded = true

  constructor(private dataService: DataService) {
    this.firstLoad()
   }

  formatTime(time){
    let newtime = NaN
    if (time != "-" && time[0] != "(" && time != "dnf" && time != "dns"){
      let tt = time.split(":")
      if (tt.length==3){
        newtime = (tt[0]*1000+tt[1]*10+tt[2]*1)/1000
      }
      else if (tt.length==2){
        if (time.includes(".")){
          let ttSpecial = time.split(".")
          newtime = (tt[0]*60000+tt[1]*1000+ttSpecial[1]*10)/1000
          
        }
        else{
          newtime = (tt[0]*1000+tt[1]*10)/1000
        }
      }
      else if (tt.length==1){
        let tt = time.split(".")
        if (tt.length==3){
          newtime = (tt[0]*60000+tt[1]*1000+tt[2]*100)/1000
        }
        else if (tt.length==2){
          let decimals = tt[1]
          if (decimals.length==1){
            decimals = decimals*100
          }
          else if (decimals.length==2){
            decimals = decimals*10
          }
          else if (decimals.length==3){
            decimals = decimals*1
          }
            newtime = (tt[0]*1000+decimals)/1000
        }
      }
    }
    return newtime
  }
  async loadEconomicCsv(){
    let lines = await d3.csv("/assets/data/EconomicData/Swimming.csv")
    let economicDict = this.processEconomicData(lines)
    this.economicDict = economicDict

    return economicDict

  }
  
  async loadPerformanceCsv(){
    let lines = await d3.csv("/assets/data/Backup/Swimming/100mfreestyleM.csv")
    let yearDict = this.processData(lines)
    this.performanceDict = yearDict

    return yearDict

  }

  processEconomicData(data){
    let economicDict: any = {}
    for (let year = 2005; year <= 2016; year++) { 
      economicDict[year] = {}
    }
    data.forEach(line => {
      let currentNoc = line.NOC
      Object.keys(economicDict).forEach(year=>{
        economicDict[year][currentNoc]= line[year]
      })
    });
    return economicDict
  }

  processData(data){
    let yearDict: any = {}
    data.forEach(line => {
      if (yearDict[line.Year]){
        if (yearDict[line.Year][line.NOC]){
          if (this.formatTime(line.Time)<yearDict[line.Year][line.NOC]){
            yearDict[line.Year][line.NOC] = this.formatTime(line.Time)
          }
        }
        else{
          yearDict[line.Year][line.NOC] = this.formatTime(line.Time)
        }
      }     
      else {
        yearDict[line.Year] = {}
        yearDict[line.Year][line.NOC]= this.formatTime(line.Time)
      }
    });
    return yearDict
  }

  firstLoad(){
    this.loadPerformanceCsv().then(d => {
      this.loadEconomicCsv().then(d =>{
        this.calculateBoxPlots()
        this.calculateEconomicBoxPlots()
        this.calculateMedals()
        this.dataService.updateAnalyticsData("updated")
        this.unloaded = false
      })
    })
  }

  mainLoad(q){
    this.q = q
    this.calculateBoxPlots()
    this.calculateEconomicBoxPlots()
    this.calculateMedals()
    if(this.q.selectedCountry){
      if(this.q.similarityThreshold){
        this.calculateThresholdSimilar(this.q.selectedCountry, this.q.similarityThreshold)
      }
      else{
        this.calculateMostSimilar5(this.q.selectedCountry)
      }
    }
    if(this.q.areasSelected){
      this.calculateAreacountries(this.q.areasSelected)
    }
    this.dataService.updateAnalyticsData("updated")
  }

  numSort(a,b) { 
    return a - b; 
  }

  getPercentiles(data, percentile){
    if (data.length > 1){
      data.sort(this.numSort)
      let index = (percentile/100) * data.length
      let result
      if (Math.floor(index) == index) {
          result = (data[(index-1)] + data[index])/2
      }
      else {
          result = data[Math.floor(index)]
      }
      return result;
    }
    else{
      return data[0]
    }
  }

  calculateBoxPlots(){
    let boxPlotsDict = {}
    let boxPlotsOutliers = {}
    Object.keys(this.performanceDict).forEach(year => {
      if (this.unloaded || this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
        let tempYearArray = []
        Object.keys(this.performanceDict[year]).forEach(country => {
          if (!isNaN(this.performanceDict[year][country])){
            tempYearArray.push(this.performanceDict[year][country])
          }
        })
        let min = Math.min.apply(Math,tempYearArray) 
        let firstQuartile = this.getPercentiles(tempYearArray, 25)
        let median = this.getPercentiles(tempYearArray, 50)
        let thirdQuartile = this.getPercentiles(tempYearArray, 75)
        let max = Math.max.apply(Math,tempYearArray)
        let iqr = thirdQuartile-firstQuartile
        let outliers =[]
        while (max > thirdQuartile + 1.5*iqr){
          outliers.push(max)
          let index = tempYearArray.indexOf(max);
          if (index > -1) {
            tempYearArray.splice(index, 1)
          }
          max = Math.max.apply(Math,tempYearArray)
        }

        boxPlotsDict[year]=[min ,firstQuartile, median, thirdQuartile, max]
        boxPlotsOutliers[year]=outliers
      }
    })
    this.boxPlotDict = boxPlotsDict
    this.boxPlotOutliers = boxPlotsOutliers
  }

  calculateEconomicBoxPlots(){
    let boxPlotsDict = {}
    let boxPlotsOutliers = {}
    Object.keys(this.economicDict).forEach(year => {
      if (this.unloaded || this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
        let tempYearArray = []
        Object.keys(this.economicDict[year]).forEach(country => {
          if (!isNaN(this.economicDict[year][country])){
            tempYearArray.push(Number(this.economicDict[year][country]))
          }
        })
        let min = Math.min.apply(Math,tempYearArray) 
        let firstQuartile = this.getPercentiles(tempYearArray, 25)
        let median = this.getPercentiles(tempYearArray, 50)
        let thirdQuartile = this.getPercentiles(tempYearArray, 75)
        let max = Math.max.apply(Math,tempYearArray)
        let iqr = thirdQuartile-firstQuartile
        let outliers =[]
        while (max > thirdQuartile + 1.5*iqr){
          outliers.push(max)
          let index = tempYearArray.indexOf(max);
          if (index > -1) {
            tempYearArray.splice(index, 1)
          }
          max = Math.max.apply(Math,tempYearArray)
        }
        boxPlotsDict[year]=[min ,firstQuartile, median, thirdQuartile, max]
        boxPlotsOutliers[year]=outliers
      }
    })
    this.economicBoxPlotDict = boxPlotsDict
    this.economicBoxPlotOutliers = boxPlotsOutliers
  }

  calculateMedals(){
    let medalsDict = {}
    Object.keys(this.performanceDict).forEach(year => {
      if (this.unloaded || this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
        let tempYearArray = Array()
        medalsDict[year] = Array()
        Object.keys(this.performanceDict[year]).forEach(country => {
          if (!isNaN(this.performanceDict[year][country])){
            tempYearArray.push(this.performanceDict[year][country])
          }
        })
        if (tempYearArray.length ==1){
          medalsDict[year]=[tempYearArray[0],tempYearArray[0],tempYearArray[0]]
        }
        else{
          let sortedArray: number[] = tempYearArray.sort((n1,n2) => n1 - n2)
          medalsDict[year] = [sortedArray[0], sortedArray[1], sortedArray[2]]
        }
      }
    })
    this.medalsDict = medalsDict
  }

  calculateAreacountries(areasSelected){
    this.q.areaCountries = []

    for(let area of areasSelected){

      let index
      let countryHitsAndMiss = {}

      if(area == "bottom-area"){
        index = 3
      }
      else if (area == "secondPercentile-area"){
        index = 2
      }
      else if (area == "firstPercentile-area"){
        index = 1
      }
      else if (area == "top-area"){
        index = 0
      }

      Object.keys(this.performanceDict).forEach(year =>{
        if (this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
          Object.keys(this.performanceDict[year]).forEach(country =>{
            if(!countryHitsAndMiss[country]){
              countryHitsAndMiss[country]={}
              countryHitsAndMiss[country].hits = 0
              countryHitsAndMiss[country].miss = 0
            }
            if(this.boxPlotDict[year][index]<=this.performanceDict[year][country] && this.performanceDict[year][country]<=this.boxPlotDict[year][index+1]){
              countryHitsAndMiss[country].hits +=1
              //this.q.areaCountries.push(country)
            }
            else{
              countryHitsAndMiss[country].miss +=1
            }
          })
        }
      })
      let max = {}
      Object.keys(countryHitsAndMiss).forEach(c =>{
        if(countryHitsAndMiss[c].hits>countryHitsAndMiss[c].miss){
          if(Object.keys(max).length<3){
            max[c]=countryHitsAndMiss[c].hits
          }
          else{
            if (countryHitsAndMiss[c].hits> Math.min.apply(Object.values(max))){
              let mymin = Object.keys(max).reduce((a, b) => max[a] < max[b] ? a : b)
              delete max[mymin]
              max[c]=countryHitsAndMiss[c].hits
            }
          }
        }
      })
      Object.keys(max).forEach(country =>{
        this.q.areaCountries.push(country)
      })
    }
  }

  calculateMostSimilar5(selectedCountry){
    let selectedCountries5 = []
    let closestDict = {}
    let countryDifferences = {}
    let selCountrypoints = 0
    for (let noc of this.NocsList){
      countryDifferences[noc]
    }
    Object.keys(this.performanceDict).forEach(year =>{
      if (this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
        if (Object.keys(this.performanceDict[year]).includes(selectedCountry)){
          if (!isNaN(this.performanceDict[year][selectedCountry])){
            Object.keys(this.performanceDict[year]).forEach(country =>{
              if(country != selectedCountry && this.NocsList.includes(country)){
                if (!isNaN(this.performanceDict[year][country])){
                  if (!countryDifferences[country]){
                    countryDifferences[country] = {}
                    countryDifferences[country].distance = 0
                    countryDifferences[country].pairs = 0
                  }
                  countryDifferences[country].distance += this.performanceDict[year][selectedCountry]-this.performanceDict[year][country]
                  countryDifferences[country].pairs += 1
                }
              }
              if(country == selectedCountry){
                selCountrypoints +=1
              }         
            })
          }
        }
      }
    })


    Object.keys(countryDifferences).forEach(country =>{
      if (Object.keys(closestDict).length<4){
        if (countryDifferences[country].pairs>=Math.floor(selCountrypoints*40/100)){
          closestDict[country] = Math.abs(countryDifferences[country].distance)
        }
      }
      else{
        if (countryDifferences[country].pairs>=Math.floor(selCountrypoints*40/100)){
          if (Math.abs(countryDifferences[country].distance )<Math.max.apply(Math, Object.values(closestDict))){
            let mymax = Object.keys(closestDict).reduce((a, b) => closestDict[a] > closestDict[b] ? a : b)
            delete closestDict[mymax]
            closestDict[country]  = Math.abs(countryDifferences[country].distance)
          }
        }
      }      
    })
    selectedCountries5 = Object.keys(closestDict)
    this.q.countries = selectedCountries5
    this.q.countries.push(selectedCountry)
  }
  calculateThresholdSimilar(selectedCountry, selectedThreshold){
    let thresholdCountries = []
    let thresholdDict = {
      "hits": number,
      "miss": number
    }
    let presenceCount = 0

    Object.keys(this.performanceDict).forEach(year =>{
      if (this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
        if (Object.keys(this.performanceDict[year]).includes(selectedCountry)){
          if (!isNaN(this.performanceDict[year][selectedCountry])){
            let yearPerf = this.performanceDict[year][selectedCountry]
            let yearMargin = yearPerf*selectedThreshold/100
            presenceCount += 1
            Object.keys(this.performanceDict[year]).forEach(country =>{
              if(country != selectedCountry && this.NocsList.includes(country)){
                if (!isNaN(this.performanceDict[year][country])){
                  if(!thresholdDict[country]){
                    thresholdDict[country] = {}
                    thresholdDict[country].hits = 0
                    thresholdDict[country].miss = 0
                  }
                  if((yearPerf-yearMargin) < this.performanceDict[year][country] && this.performanceDict[year][country] < (yearPerf + yearMargin)){
                    thresholdDict[country].hits += 1
                  }
                  else{
                    thresholdDict[country].miss += 1    
                  }
                }
              }
            })
          }
        }
      }
    })

    
    Object.keys(thresholdDict).forEach(country =>{
      if (thresholdDict[country].miss == 0){
        if (thresholdDict[country].hits > 40*presenceCount/100){
          thresholdCountries.push(country)
        }
      }
    })
    this.q.countries = thresholdCountries
    this.q.countries.push(selectedCountry) 
  }

}
