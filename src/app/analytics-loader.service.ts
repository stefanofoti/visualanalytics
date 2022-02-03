import { Injectable } from '@angular/core';
import { ObjectUnsubscribedError, of, Subscription } from 'rxjs';
import * as ld from "lodash";
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsLoaderService {

  public performanceDict: any = {}

  constructor() {
    this.mainLoad()
   }

  
  async loadPerformanceCsv(){
    let lines = await d3.csv("/assets/data/Backup/Swimming/100mfreestyleM.csv")
    let yearDict = this.processData(lines)
    console.log(lines)

    return yearDict

  }

  processData(data){
    let yearDict: any = {}
    data.forEach(line => {
      if (yearDict[line.Year]){
        yearDict[line.Year][line.NOC] = line.Time
      }     
      else {
        yearDict[line.Year] = {}
        yearDict[line.Year][line.NOC]= line.Time
      }
    });
    return yearDict
  }

  mainLoad(){
    this.loadPerformanceCsv().then(d => {
      console.log(d)

    })

  }

}
