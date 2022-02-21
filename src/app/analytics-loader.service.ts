import { Injectable } from '@angular/core';
import { ObjectUnsubscribedError, of, Subscription } from 'rxjs';
import * as ld from "lodash";
import * as d3 from 'd3';
import { forEach, number } from 'mathjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsLoaderService {

  public performanceDict: any = {}
  public medalsDict: any = {}
  public boxPlotDict: any = {}
  public boxPlotOutliers: any = {}
  public q: any = {}

  dummyVar: boolean = false

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
  
  async loadPerformanceCsv(){
    let lines = await d3.csv("/assets/data/Backup/Swimming/100mfreestyleM.csv")
    let yearDict = this.processData(lines)
    console.log(lines)
    this.performanceDict = yearDict

    return yearDict

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
      this.calculateBoxPlots()
      this.calculateMedals()
      this.dataService.updateAnalyticsData("updated")
      this.unloaded = false
    })
  }

  mainLoad(q){
    this.q = q
      this.calculateBoxPlots()
      this.calculateMedals()
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
        let secondQuartile = this.getPercentiles(tempYearArray, 75)
        let max = Math.max.apply(Math,tempYearArray)
        let iqr = secondQuartile-firstQuartile
        let outliers =[]
        while (max > secondQuartile + 1.5*iqr){
          outliers.push(max)
          let index = tempYearArray.indexOf(max);
          if (index > -1) {
            tempYearArray.splice(index, 1)
          }
          min = Math.min.apply(Math,tempYearArray) 
          firstQuartile = this.getPercentiles(tempYearArray, 25)
          median = this.getPercentiles(tempYearArray, 50)
          secondQuartile = this.getPercentiles(tempYearArray, 75)
          max = Math.max.apply(Math,tempYearArray)
          iqr = secondQuartile-firstQuartile
        }

        boxPlotsDict[year]=[min ,firstQuartile, median, secondQuartile, max]
        boxPlotsOutliers[year]=outliers
      }
    })
    this.boxPlotDict = boxPlotsDict
    this.boxPlotOutliers = boxPlotsOutliers
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

}
