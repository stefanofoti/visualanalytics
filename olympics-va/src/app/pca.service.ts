import { Injectable } from '@angular/core';
import PCA from 'pca-js';
import { PCAEntry, PcaQuery } from 'src/data/data';

@Injectable({
  providedIn: 'root'
})
export class PcaService {

  constructor() { }

  filterData(q: PcaQuery, lines: any[]) {
    let result = lines.map(l =>
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
    return result.slice(0,15000)
  }

  async computePca(q: PcaQuery, lines: any[]): Promise<PCAEntry[]> {
    let data = this.filterData(q, lines)
    console.log(data)
    
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
        z: c[2]
      }
      return r
    })
    console.log("pcaresult", result)
    return result
    // return []
  }
}
