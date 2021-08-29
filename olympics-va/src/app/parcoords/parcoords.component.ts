import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { bronzes, golds, Medal } from 'src/data/data';
import { DataService } from '../data.service';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-parcoords',
  templateUrl: './parcoords.component.html',
  styleUrls: ['./parcoords.component.css']
})
export class ParcoordsComponent implements OnInit {

  dimensions: any
  private subDataReadiness: Subscription
  private subYearRangeChanged: Subscription
  private subSelectedMedals: Subscription

  private isDataReady: boolean
  private spacing: number = 0

  constructor(private loaderService: LoaderService, private dataService: DataService) {
    this.subYearRangeChanged = dataService.changedYearRangeMessage.subscribe(message => this.onYearRangeChanged(message))
    this.subDataReadiness = dataService.olympycsReadinessMessage.subscribe(message => this.dataReady(message))
    this.subSelectedMedals = dataService.selectedMedalsMessage.subscribe(message => this.onSelectedMedalsChanged(message))
  }

  dataReady(isReady: Boolean): any {
    if(isReady) {
      this.isDataReady = true
      this.plot()
    }
  }

  onSelectedMedalsChanged(message: Medal[]) {

  }

  onYearRangeChanged(newRange: number[]){

  }

  ngOnInit(): void {
  }

  plot(): void {

    //let [stats, max] = this.loaderService.computeMedalsByNationInRange(1920, 2000, ["golds"])
    let stats = this.loaderService.olympicsDict["NOC"][2004]
    stats = Object.values(stats)
    stats = stats.map(element => {
      return {
        ...element.sports,
        name: element.name
      }
    });

    console.log(stats)
    // let data = Object.values(stats)
    let c = this
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 50, bottom: 10, left: 50 }
    const width = 1200 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // append the svg object to the body of the page
    const svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("id", "svg_parcoords")
      .attr("width", "100%")
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        `translate(${margin.left},${margin.top})`);

    let newWidth = document.getElementById("svg_parcoords").clientWidth
    console.log(newWidth)
    // d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv").then(function (data) {

      const color = d3.scaleOrdinal()
        .domain(["setosa", "versicolor", "virginica"])
        .range(["#440154ff", "#21908dff", "#fde725ff"])

      // c.dimensions = ["Petal_Length", "Petal_Width", "Sepal_Length", "Sepal_Width"]

      c.dimensions = ["Athletics Men's High Jump", "Athletics Men's 400 metres", "Boxing Men's Featherweight", "Table Tennis Men's Singles"]
      //c.dimensions = ["a", "b", "c"]


      const y = {}
      for (let i in c.dimensions) {
        let name = c.dimensions[i]
        y[name] = d3.scaleLinear()
          .domain([0, 3]) // --> Same axis range for each group
          // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
          .range([height, 0])
      }

      let x = d3.scalePoint()
      .range([0, newWidth-100])
        .domain(c.dimensions);
    
      const highlight = function (event, d) {
        let selected_specie: string = d.Species
        let colorNumb: any = color(selected_specie)
        // first every group turns grey
        d3.selectAll(".line")
          .transition().duration(200)
          .style("stroke", "lightgrey")
          .style("opacity", "0.2")
        // Second the hovered specie takes its color
        d3.selectAll("." + selected_specie)
          .transition().duration(200)
          .style("stroke", /*color(selected_specie)*/ colorNumb)
          .style("opacity", "1")
      }

      // Unhighlight
      const doNotHighlight = function (event, d) {
        let w: any = d
        d3.selectAll(".line")
          .transition().duration(200).delay(1000)
          .style("stroke", "#0000ff")
          .style("opacity", 0.5)
      }


      // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
      const path = function (d) {
        // console.log(d)
        // return d3.line()([[10, 60], [40, 90], [60, 10], [190, 10]])
        return d3.line()(c.dimensions.map(p => { 
          //console.log(p)
          //console.log(x(p))
          let totMedals = d[p] ? (d[p].golds + d[p].bronzes + d[p].silvers) : 0
          //console.log(d.name + " - plotting: " + totMedals + " x: " + x(p) + " y: " + y[p](totMedals))

          return [x(p), y[p](totMedals)-c.spacing]; 
          return [3,50]
        }));
      }

      // Draw the lines
      svg.selectAll("myPath")
        .data(stats)
        .join("path")
        .attr("class", d => { 
          let x: any = d
          return "line " }) // 2 class for each line: 'line' and the group name
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "#0000ff")
        .style("opacity", 0.5)
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight)

        var yscale = d3.scaleLinear()
        .domain([0, 3])
        .range([height - c.spacing, 0]);

      // Draw the axis:
      svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(c.dimensions).enter()
        .append("g")
        .attr("class", "axis")
        // I translate this element to its right position on the x axis
        //.attr("transform", function (d) { return `translate(${x(d)})` })
        // And I build the axis with the call function
        .each(function (d) { d3.select(this).call(d3.axisLeft(yscale).ticks(5)); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text("Medals")
        .style("fill", "black")



    //})

  }

}
