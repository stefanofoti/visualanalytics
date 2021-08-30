import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { bronzes, golds, Medal, PreCheckedSports2 } from 'src/data/data';
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

  private yearRange: number[]

  private selectedMedals: string[]

  private x: any
  private y: any
  private svg: any

  private stats: any
  private max: number
  private height: number 
  private width: number 

  constructor(private loaderService: LoaderService, private dataService: DataService) {
    this.subYearRangeChanged = dataService.changedYearRangeMessage.subscribe(message => this.onYearRangeChanged(message))
    this.subDataReadiness = dataService.olympycsReadinessMessage.subscribe(message => this.dataReady(message))
    this.subSelectedMedals = dataService.selectedMedalsMessage.subscribe(message => this.onSelectedMedalsChanged(message))
  }

  dataReady(isReady: Boolean): any {
    if (isReady) {
      this.isDataReady = true
      this.getData()
      this.plot()
      this.update()
    }
  }

  onSelectedMedalsChanged(message: Medal[]) {
    this.selectedMedals = []
    message.map(med => {
      med.isChecked && this.selectedMedals.push(med.id)
    })
    // this.getData()
    // this.update()
  }

  onYearRangeChanged(newRange: number[]) {
    this.yearRange = newRange
  }

  ngOnInit(): void {
  }

  getData(): void {
    let m
    [this.stats, m] = this.loaderService.computeMedalsByNationInRange(this.yearRange[0], this.yearRange[1], this.selectedMedals, PreCheckedSports2)
    this.max = m as number
  }

  plot(): void {
    if (!this.isDataReady) {
      return
    }

    console.log(this.stats)
    // let data = Object.values(stats)
    let c = this
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 50, bottom: 10, left: 50 }
    // this.width = 1200 - margin.left - margin.right
    this.height = 400 - margin.top - margin.bottom

    // append the svg object to the body of the page
    c.svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("id", "svg_parcoords")
      .attr("width", "100%")
      .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        `translate(${margin.left},${margin.top})`);

    this.width = document.getElementById("svg_parcoords").clientWidth
    // d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv").then(function (data) {

    // c.dimensions = ["Petal_Length", "Petal_Width", "Sepal_Length", "Sepal_Width"]

    c.dimensions = ["Athletics Men's High Jump", "Athletics Men's 400 metres", "Boxing Men's Featherweight", "Table Tennis Men's Singles"]
    //c.dimensions = ["a", "b", "c"]


    c.y = {}
    for (let i in c.dimensions) {
      let name = c.dimensions[i]
      c.y[name] = d3.scaleLinear()
        .domain([0, c.max]) // --> Same axis range for each group
        // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
        .range([c.height, 0])
    }

    c.x = d3.scalePoint()
      .range([0, c.width - 79])
      .domain(c.dimensions);
    //})

  }

  update() {
    let c = this
    const highlight = function (event, d) {

      const color = d3.scaleOrdinal()
      .domain(["setosa", "versicolor", "virginica"])
      .range(["#440154ff", "#21908dff", "#fde725ff"])

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
        let totMedals = d[p] ? (d[p].golds + d[p].bronzes + d[p].silvers) : 0
        //console.log(d.name + " - plotting: " + totMedals + " x: " + x(p) + " y: " + y[p](totMedals))

        return [c.x(p), c.y[p](totMedals) - c.spacing];
        return [3, 50]
      }));
    }

    // Draw the lines
    c.svg.selectAll("myPath")
      .data(Object.values(c.stats))
      .join("path")
      .attr("class", d => {
        let x: any = d
        return "line"
      }) // 2 class for each line: 'line' and the group name
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "#0000ff")
      .style("opacity", 0.5)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight)

    var yscale = d3.scaleLinear()
      .domain([0, c.max])
      .range([c.height - c.spacing, 0]);

    // Draw the axis:
    c.svg.selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(c.dimensions).enter()
      .append("g")
      .attr("class", "axis")
      // I translate this element to its right position on the x axis
      .attr("transform", function (d) { return `translate(${c.x(d)})` })
      // And I build the axis with the call function
      .each(d => {
        console.log(d)
        let laxis: any = d3.axisLeft(yscale).ticks(5)
        d3.select(".axis").call(laxis)
      })
      //.each(function (d) { d3.select(this).call(d3.axisLeft(yscale).ticks(5)); })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(d => d as string)
      .style("fill", "black")
  }

}
