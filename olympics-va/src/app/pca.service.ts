import { Injectable } from '@angular/core';
import PCA from 'pca-js';

@Injectable({
  providedIn: 'root'
})
export class PcaService {

  constructor() { }

  dummyDemo() {


    var data = [[40,50,60,20,70],[50,70,60,25,90],[80,70,90,30,60],[50,60,80,50,50]];
    // var data = [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]];
    var vectors = PCA.getEigenVectors(data);
    let m = [vectors[0].vector,vectors[1].vector,vectors[2].vector]
    let mt = PCA.transpose(m)
    //let adjData = PCA.computeAdjustedData(data, vectors)
    // console.log(adjData)
    let components = PCA.multiply(data, mt)
    console.log(components)
    console.log("components", components)


  }
}
