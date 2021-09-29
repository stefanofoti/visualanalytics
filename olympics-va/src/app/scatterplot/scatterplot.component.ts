import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import Plotly from 'plotly.js'

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.css']
})
export class ScatterplotComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // this.plot()
    this.newPlot()
  }

  newPlot() {


    d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/3d-scatter.csv').then(function (rows) {
      function unpack(rows, key) {
        return rows.map(function (row) { return row[key]; });
      }

      var trace1 = {
        x: unpack(rows, 'x1'), y: unpack(rows, 'y1'), z: unpack(rows, 'z1'),
        mode: 'markers',
        marker: {
          size: 12,
          line: {
            color: 'rgba(217, 217, 217, 0.14)',
            width: 0.5
          },
          opacity: 0.8
        },
        type: 'scatter3d'
      };

      var trace2 = {
        x: unpack(rows, 'x2'), y: unpack(rows, 'y2'), z: unpack(rows, 'z2'),
        mode: 'markers',
        marker: {
          color: 'rgb(127, 127, 127)',
          size: 12,
          symbol: 'circle',
          line: {
            color: 'rgb(204, 204, 204)',
            width: 1
          },
          opacity: 0.8
        },
        type: 'scatter3d'
      };

      var data = [trace1, trace2];
      var layout = {
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0
        }
      };
      Plotly.newPlot('myDiv', data, layout);
    });

  }

  plot(): void {

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#scatterplot_div")
      .append("svg")
      //.attr("width", width + margin.left + margin.right)
      .attr("width", "100%")
      //.attr("height", height + margin.top + margin.bottom)
      .attr("height", "100%")

      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv").then(function (data) {

      // Add X axis
      const x = d3.scaleLinear()
        .domain([0, 4000])
        .range([0, width]);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      // Add Y axis
      const y = d3.scaleLinear()
        .domain([0, 500000])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add dots
      svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", d => { return x((d as any).GrLivArea); })
        .attr("cy", d => { return y((d as any).SalePrice); })
        .attr("r", 1.5)
        .style("fill", "#69b3a2")

    })
  }

}
