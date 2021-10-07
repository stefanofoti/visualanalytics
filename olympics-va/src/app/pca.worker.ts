/// <reference lib="webworker" />
import PCA from 'pca-js';


addEventListener('message', ({ data }) => {
  var vectors = PCA.getEigenVectors(data);
  let m
  if (vectors.length< 3) {
    m = [vectors[0].vector, vectors[1].vector] //TODO plot 2d
  } else {
    m = [vectors[0].vector, vectors[1].vector, vectors[2].vector]
  }
  let mt = PCA.transpose(m)
  let components = PCA.multiply(data, mt)
  postMessage(components)

  // const response = `worker response to ${data}`;
});
