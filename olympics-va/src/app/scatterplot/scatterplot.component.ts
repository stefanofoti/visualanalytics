import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as Plotly from 'plotly.js/dist/plotly'
import { Subscription } from 'rxjs';
import { PCAEntry } from 'src/data/data';
import { DataService } from '../data.service';

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.css']
})
export class ScatterplotComponent implements OnInit {

  subPCAReady: Subscription

  constructor(private dataService: DataService) {
    this.subPCAReady = dataService.pcaDataReadyMessage.subscribe(message => this.dataReady(message))

  }

  dataReady(entries: PCAEntry[]): void {
    console.log("plotting: data ready...")

    entries.length>0 && this.plot3d(entries)
  }

  ngOnInit(): void {
    // this.plot()
  }


  newPlot2(){
    var trace1 = {
      x: [1, 2, 3, 4, 5],
      y: [1, 6, 3, 6, 1],
      mode: 'markers',
      type: 'scatter',
      name: 'Team A',
      text: ['A-1', 'A-2', 'A-3', 'A-4', 'A-5'],
      marker: { size: 12 }
    };
    
    var trace2 = {
      x: [1.5, 2.5, 3.5, 4.5, 5.5],
      y: [4, 1, 7, 1, 4],
      mode: 'markers',
      type: 'scatter',
      name: 'Team B',
      text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
      marker: { size: 12 }
    };
    
    var data = [ trace1, trace2 ];
    
    var layout = {
      xaxis: {
        range: [ 0.75, 5.25 ]
      },
      yaxis: {
        range: [0, 8]
      },
      title:'Data Labels Hover'
    };
    
    Plotly.newPlot('myDiv', data, layout);
    
  }

  extractComponents(entries: PCAEntry[], type: string) {
    let res = entries.map(e => e[type])
    return res
  }

  plot3d(entries: PCAEntry[]) {
    console.log("plotting pca...")

    let x = this.extractComponents(entries, "x")
    let y = this.extractComponents(entries, "y")
    let z = this.extractComponents(entries, "z")

    console.log("plotting x", x, "y: ", y, "z:", z)

      var trace1 = {        
        x: x,
        y: y,
        z: z,
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

      var data = [trace1];
      
      var layout = {
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0
        }
      };
      Plotly.newPlot('myDiv', data, layout);

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
