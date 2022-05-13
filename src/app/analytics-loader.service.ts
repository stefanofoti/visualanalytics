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

  private completePerformanceDict: any = {}
  private completeEconDict: any = {}
  private completeboxPlotDict: any = {}
  private completeeconomicBoxPlotDict: any = {}
  public completeinterpolatedPerfDict: any = {}
  public interpolatedPerfDict: any = {}
  public performanceDict: any = {}
  public economicDict: any = {}
  public ratioDict: any = {}
  public medalsDict: any = {}
  public boxPlotDict: any = {}
  public boxPlotOutliers: any = {}
  public interpolatedBoxPlotDict: any = {}
  public economicBoxPlotDict: any = {}
  public economicBoxPlotOutliers: any = {}
  public ratioBoxPlotDict: any = {}
  public ratioBoxPlotOutliers: any = {}
  public efficiencyDict: any = {}
  public investmentDict: any = {}
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
    if (this.unloaded){
      this.completeEconDict = economicDict
    }

    return economicDict

  }
  
  async loadPerformanceCsv(){
    let lines = await d3.csv("/assets/data/Backup/Swimming/100mfreestyleM.csv")
    let yearDict = this.processData(lines)
    this.performanceDict = yearDict
    if (this.unloaded){
      this.completePerformanceDict = yearDict
    }

    return yearDict

  }

  async loadRatioPrediction(){
    let lines = await d3.csv("/assets/data/ratioResults.csv")
    let efficiencyDict = this.processRatioPrediction(lines)
    this.efficiencyDict = efficiencyDict

    return efficiencyDict

  }

  async loadInvPrediction(){
    let lines = await d3.csv("/assets/data/investmentsResults.csv")
    let invDict = this.processInvestmentPrediction(lines)
    this.investmentDict = invDict
    return invDict
  }

  processRatioPrediction(data) {
    let ratioDict: any = {}
    for (let year = 2008; year <= 2024; year++) {
      ratioDict[year] = {}
    }

    data.forEach(line => {
      let currentNoc = line.NOC
      let currentYear = line.Year
      if (Object.keys(ratioDict).includes(currentYear)) {
        ratioDict[currentYear][currentNoc]=parseFloat(line.Efficiency)
      }      
    });

    console.log("newDicts", ratioDict)
    return ratioDict
  }

  processInvestmentPrediction(data) {
    let invDict: any = {}
    for (let year = 2005; year <= 2024; year++) {
      invDict[year] = {}
    }

    data.forEach(line => {
      let currentNoc = line.NOC
      let currentYear = line.Year
      if (Object.keys(invDict).includes(currentYear)) {
        invDict[currentYear][currentNoc]=parseFloat(line.Investment)
      }      
    });

    console.log("newDicts", invDict)
    return invDict
  }

  processEconomicData(data){
    let economicDict: any = {}
    for (let year = 2005; year <= 2016; year++) { 
      economicDict[year] = {}
    }
    data.forEach(line => {
      let currentNoc = line.NOC
      Object.keys(economicDict).forEach(year=>{
        economicDict[year][currentNoc]= line[year] /1000000
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
        this.loadInvPrediction().then(d =>{
          this.loadRatioPrediction().then(d =>{
            this.calculateBoxPlots()
            this.calculateEconomicBoxPlots()
            this.interpolatePerformance()
            this.calculateRatio()
            this.calculateRatioBoxPlot()
            this.calculateMedals()
            this.dataService.updateAnalyticsData("updated")
            this.unloaded = false
          })
        })
      })
    })
  }

  mainLoad(q){
    if (!this.unloaded){
      this.q = q
      console.log("testnew", "from loader", this.q)
      this.calculateBoxPlots()
      this.calculateEconomicBoxPlots()
      this.calculateRatio()
      this.calculateRatioBoxPlot()
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

  calculateRatio(){
    let ratioDict = {}
    for (let year = 2005; year <= 2016; year++){
      if (this.unloaded || this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
        if(Object.keys(this.interpolatedPerfDict).includes(String(year))){
          Object.keys(this.economicDict[year]).forEach(noc =>{
            if(Object.keys(this.interpolatedPerfDict[year]).includes(noc)){
              let perf = this.interpolatedPerfDict[year][noc]
              let econ = this.economicDict[year][noc]
              let invertedPerf = 1/perf
              let ratio = (invertedPerf/econ)
              if(!ratioDict[year]){
                ratioDict[year] = {}
              }
              ratioDict[year][noc] = ratio
            }
          })
        }
      }
    }
    this.ratioDict = ratioDict

  }

  calculateRatioBoxPlot(){
    let ratioBoxPlotsDict = {}
    let ratioBoxPlotsOutliers = {}
    Object.keys(this.ratioDict).forEach(year => {
      if (this.unloaded || this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
        let tempYearArray = []
        Object.keys(this.ratioDict[year]).forEach(country => {
          if (!isNaN(this.ratioDict[year][country])){
            tempYearArray.push(this.ratioDict[year][country])
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
        while (min < firstQuartile - 1.5*iqr){
          outliers.push(min)
          let index = tempYearArray.indexOf(min);
          if (index > -1) {
            tempYearArray.splice(index, 1)
          }
          min = Math.min.apply(Math,tempYearArray)
        }

        ratioBoxPlotsDict[year]=[min ,firstQuartile, median, thirdQuartile, max]
        ratioBoxPlotsOutliers[year]=outliers
      }
    })
    this.ratioBoxPlotDict = ratioBoxPlotsDict
    this.ratioBoxPlotOutliers = ratioBoxPlotsOutliers
    console.log("ratio", this.ratioBoxPlotOutliers)

  }

  findAllNocs(){
    let nocs = []
    Object.keys(this.completePerformanceDict).forEach(year =>{
      Object.keys(this.completePerformanceDict[year]).forEach(noc => {
        if(!nocs.includes(noc)){
          nocs.push(noc)
        }
      })
    })
    return nocs
  }

  interpolatePerformance(){
    let interpolatedDict = {}
    let allNocs = this.findAllNocs()
    for(let year = 1896; year<2021; year++){
      allNocs.forEach(noc =>{
        if(Object.keys(this.completePerformanceDict).includes(String(year)) && Object.keys(this.completePerformanceDict[year]).includes(noc)){
          if(!interpolatedDict[year]){
            interpolatedDict[year] = {}
          }
          interpolatedDict[year][noc] = this.completePerformanceDict[year][noc]
        }
        else{
          let bottom
          let top
          let bottomDist = Infinity
          let topDist = Infinity
          let olympicsYears = Object.keys(this.completePerformanceDict).map(Number)
          for (let i = 0; i < olympicsYears.length; i++){
            let olYear = olympicsYears[i]
            if (olYear < Number(year)){
              if (Object.keys(this.completePerformanceDict[olYear]).includes(noc) && !isNaN(this.completePerformanceDict[olYear][noc])){
                bottomDist = Number(year) - olYear
                bottom = olYear                
              }
            }else{
              if (Object.keys(this.completePerformanceDict[olYear]).includes(noc) && !isNaN(this.completePerformanceDict[olYear][noc])){
                topDist = olYear - Number(year)
                top = olYear
                break    
              }        
            }
          }
          if(bottomDist != Infinity && topDist != Infinity){
            let bottomVal = this.completePerformanceDict[bottom][noc]
            let topVal = this.completePerformanceDict[top][noc]
            let incrementRatio = bottomDist/(bottomDist + topDist)
            let increment = incrementRatio*(topVal - bottomVal)
            if(!interpolatedDict[year]){
              interpolatedDict[year] = {}              
            }
            interpolatedDict[year][noc] = bottomVal + increment
          }
        }
      })
    }
    this.completeinterpolatedPerfDict = interpolatedDict

    Object.keys(this.completeinterpolatedPerfDict).forEach(year =>{
      Object.keys(this.completeinterpolatedPerfDict[year]).forEach(noc =>{
        if(Object.keys(this.completeEconDict).includes(year) && Object.keys(this.completeEconDict[year]).includes(noc)){
          if(!this.interpolatedPerfDict[year]){
            this.interpolatedPerfDict[year] = {}
          }
          this.interpolatedPerfDict[year][noc] = this.completeinterpolatedPerfDict[year][noc]
        }
      })
    })
    console.log("interpolated test", this.completeinterpolatedPerfDict, this.interpolatedPerfDict)
  }

  calculateBoxPlots(){
    let boxPlotsDict = {}
    let boxPlotsOutliers = {}
    Object.keys(this.completeinterpolatedPerfDict).forEach(year => {
      if (this.unloaded || this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
        let tempYearArray = []
        Object.keys(this.completeinterpolatedPerfDict[year]).forEach(country => {
          if (!isNaN(this.completeinterpolatedPerfDict[year][country])){
            tempYearArray.push(this.completeinterpolatedPerfDict[year][country])
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
    if (this.unloaded){
      this.completeboxPlotDict = boxPlotsDict
    }
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
        while (min < firstQuartile - 1.5*iqr){
          outliers.push(min)
          console.log("outliers", min)
          let index = tempYearArray.indexOf(min);
          if (index > -1) {
            tempYearArray.splice(index, 1)
          }
          min = Math.min.apply(Math,tempYearArray)
        }
        boxPlotsDict[year]=[min ,firstQuartile, median, thirdQuartile, max]
        boxPlotsOutliers[year]=outliers
      }
    })
    this.economicBoxPlotDict = boxPlotsDict
    this.economicBoxPlotOutliers = boxPlotsOutliers
    if (this.unloaded){
      this.completeeconomicBoxPlotDict = boxPlotsDict
    }
  }

  calculateMedals(){
    let medalsDict = {}
    Object.keys(this.completeinterpolatedPerfDict).forEach(year => {
      if (this.unloaded || this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
        let tempYearArray = Array()
        medalsDict[year] = Array()
        Object.keys(this.completeinterpolatedPerfDict[year]).forEach(country => {
          if (!isNaN(this.completeinterpolatedPerfDict[year][country])){
            tempYearArray.push(this.completeinterpolatedPerfDict[year][country])
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
