import { Injectable } from '@angular/core';
import PCA from 'pca-js';
import { PCAEntry, PcaQuery } from 'src/data/data';

@Injectable({
  providedIn: 'root'
})
export class PcaService {

  constructor() { }

  shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

  aggregateData(lines){
    let aggregateLines = []
    let medalSum = {}
    for (const elem in lines){
      if (lines[elem].Medal !== "NA"){
        let currentNOC = lines[elem].NOC_value
        let currentYear = lines[elem].Year
        let currentSport = lines[elem].Sport_value
        if(medalSum[currentNOC]){
          if(medalSum[currentNOC][currentYear]){
            if(medalSum[currentNOC][currentYear][currentSport]){
              medalSum[currentNOC][currentYear][currentSport]++
            }else{
              medalSum[currentNOC][currentYear][currentSport]=1
            }
          } else {
            medalSum[currentNOC][currentYear]={}
            if(medalSum[currentNOC][currentYear][currentSport]){
              medalSum[currentNOC][currentYear][currentSport]++
            }else{
              medalSum[currentNOC][currentYear][currentSport]=1
            }
          }          
        } else {
          medalSum[currentNOC]={}
          if(medalSum[currentNOC][currentYear]){
            if(medalSum[currentNOC][currentYear][currentSport]){
              medalSum[currentNOC][currentYear][currentSport]++
            }else{
              medalSum[currentNOC][currentYear][currentSport]=1
            }
          } else {
            medalSum[currentNOC][currentYear]={}
            if(medalSum[currentNOC][currentYear][currentSport]){
              medalSum[currentNOC][currentYear][currentSport]++
            }else{
              medalSum[currentNOC][currentYear][currentSport]=1
            }
          }     
        }
      }
    }
    Object.keys(medalSum).forEach( noc => {
      Object.keys(medalSum[noc]).forEach(year => {
        Object.keys(medalSum[noc][year]).forEach(sport => {
          aggregateLines.push([Number(noc),Number(year),Number(sport),medalSum[noc][year][sport]])          
        })        
      })
    })
    console.log("aggregatelines", aggregateLines)
    return aggregateLines
  }

  filterData(q: PcaQuery, lines: any[]) {

    let filteredLines = []
    filteredLines = this.aggregateData(lines)
    
    for (const elem in lines){
      // if (lines[elem].Medal !== "NA"){
      //   filteredLines.push(lines[elem])
      // }

      // if (lines[elem].NOC === q.selectedNocs){
      //   filteredLines.push(lines[elem])
      // }
    }
    console.log("lines after",filteredLines)
    let result = filteredLines.map(l =>
      [
        Number(l.Sex_value),
        Number(l.Season_value),
        Number(l.Medal_value),
        Number(l.Sport_value),
        Number(l.NOC_value),
        Number(l.Name_value),
        Number(l.Event_value)
      ]
    )
    return filteredLines
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
    let result = components.map(c => {
      let r: PCAEntry = {
        x: c[0],
        y: c[1],
        z: c[2],
        //name: ricavare i NOC in qualche modo
      }
      return r
    })
    console.log("pcaresult", result)
    return result
    // return []
  }
}
