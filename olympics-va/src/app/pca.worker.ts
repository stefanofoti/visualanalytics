/// <reference lib="webworker" />

import { PCAEntry } from "src/data/data";
import PCA from 'pca-js';


addEventListener('message', ({ data }) => {
  console.log("pca worker data: ", data);
 
  
  var vectors = PCA.getEigenVectors(data);
  let m = [vectors[0].vector, vectors[1].vector, vectors[2].vector]
  let mt = PCA.transpose(m)
  //let adjData = PCA.computeAdjustedData(data, vectors)
  // console.log(adjData)
  let components = PCA.multiply(data, mt)
  postMessage(components)

  // const response = `worker response to ${data}`;
});
