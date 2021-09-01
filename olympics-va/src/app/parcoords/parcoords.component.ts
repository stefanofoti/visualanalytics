import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { bronzes, golds, Medal, PreCheckedSports, PreCheckedSports2, silvers, Sport } from 'src/data/data';
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
  private subSelectedSports: Subscription
  private subDataUpdated: Subscription

  private isDataReady: boolean
  private spacing: number = 0

  private yearRange: number[]

  private selectedMedals: string[]
  private selectedSports: string[]

  private x: any
  private y: any
  private svg: any

  private stats: any
  private maxSelectedSports: number
  private height: number
  private width: number


  private firstPlot = true

  currentSelected: any = {}

  constructor(private loaderService: LoaderService, private dataService: DataService) {
    //this.subYearRangeChanged = dataService.changedYearRangeMessage.subscribe(message => this.onYearRangeChanged(message))
    // this.subDataReadiness = dataService.olympycsReadinessMessage.subscribe(message => this.dataReady(message))
    // this.subSelectedMedals = dataService.selectedMedalsMessage.subscribe(message => this.onSelectedMedalsChanged(message))
    // this.subSelectedSports = dataService.selectedSportsMessage.subscribe(message => this.onSelectedSportsChanged(message))
    this.subDataUpdated = dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
  }

  dataReady(message): any {
    if(message && message.length == 5) {
      this.stats = message[0]
      this.maxSelectedSports = message[2]
      this.dimensions = message[3]
      if(this.dimensions.length == 0) this.dimensions = ["Athletics Men's High Jump", "Athletics Men's 400 metres", "Boxing Men's Featherweight"]
      if(this.dimensions.length > 8) this.dimensions = this.dimensions.splice(8)
      this.selectedMedals = message[4]
      this.isDataReady = true
      this.firstPlot && this.plot()
      this.update()
    }
  }

  onSelectedMedalsChanged(message: Medal[]) {

    this.selectedMedals = []
    message.map(med => {
      med.isChecked && this.selectedMedals.push(med.id)
    })
    if (this.isDataReady) {
      this.getData()
      this.update()
    }
  }


  onSelectedSportsChanged(message: Sport[]) {
    this.selectedSports = []
    // mantain the order in which the user added sports 
    message.forEach(sp => {
      sp.isChecked && !this.selectedSports.includes(sp.name) && this.selectedSports.push(sp.name)
      !sp.isChecked && this.selectedSports.includes(sp.name) && this.selectedSports.splice(this.selectedSports.indexOf(sp.name), 1)
    })
    this.selectedSports.length > 0 ? this.dimensions = this.selectedSports : this.dimensions = ["Speed Skating Women's 500 metres", "Speed Skating Women's 1,000 metres"]
    // this.dimensions = this.selectedSports
    if (this.isDataReady) {
      this.getData()
      this.update()
    }
  }

  onYearRangeChanged(newRange: number[]) {
    this.yearRange = newRange
    if (this.isDataReady) {
      this.getData()
      this.update()
    }
  }

  ngOnInit(): void {

  }

  getData(): void {
    console.log(this.isDataReady)
    if (!this.isDataReady) {
      return
    }
    let m
    [this.stats, , m] = this.loaderService.computeMedalsByNationInRange(this.yearRange[0], this.yearRange[1], this.selectedMedals, PreCheckedSports2)
    this.maxSelectedSports = m as number
  }

  plot(): void {
    this.firstPlot = false
    // let data = Object.values(stats)
    let c = this
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 50, bottom: 10, left: 50 }
    // this.width = 1200 - margin.left - margin.right
    this.height = 400 - margin.top - margin.bottom

    // append the svg object to the body of the page
    this.svg = d3.select("#div_parcoord")
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

    // c.dimensions = ["Athletics Men's High Jump", "Athletics Men's 400 metres", "Boxing Men's Featherweight"]
    // c.dimensions = PreCheckedSports2
    //c.dimensions = ["a", "b", "c"]

    this.computeXY()
    //this.drawAxis()

    // Draw the lines
    this.svg.selectAll("myPath")
      .data(Object.values(c.stats))
      .join("path")
      .attr("class", d => {
        let x: any = d
        return "line parcoord-line"
      }) // 2 class for each line: 'line' and the group name
      .attr("d", d => this.path(d, c))
      .attr('id', d => 'line-'+d.name)
      .style("fill", "none")
      .style("stroke", "#0000ff")
      .style("opacity", 0.5)
      .on("mouseover", (event, d) => this.highlight(event, d, c))
      .on("mouseleave", (event, d) => this.doNotHighlight(event, d, c))

  }

  highlight(ev, d, c) {
    c.currentSelected = d
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
    d3.select("#line-" + c.currentSelected.name)
      .transition().duration(200)
      .style("stroke", /*color(selected_specie)*/ "#00ffff")
      .style("opacity", "1")
  }

  // Unhighlight
  doNotHighlight(ev, d, c) {
    c.currentSelected = {}
    d3.selectAll(".line")
      .transition().duration(200).delay(1000)
      .style("stroke", "#0000ff")
      .style("opacity", 0.5)
  }


  path(d, c) {
    // return d3.line()([[10, 60], [40, 90], [60, 10], [190, 10]])
    return d3.line()(c.dimensions.map(p => {
      let totMedals = 0
      c.selectedMedals.includes(golds) && (totMedals += d[p].golds)
      c.selectedMedals.includes(bronzes) && (totMedals += d[p].bronzes)
      c.selectedMedals.includes(silvers) && (totMedals += d[p].silvers)
      return [c.x(p), c.y[p](totMedals) - c.spacing];
      return [3, 50]
    }));
  }

  computeXY() {
    let c = this
    c.y = {}
    for (let i in c.dimensions) {
      let name = c.dimensions[i]
      c.y[name] = d3.scaleLinear()
        .domain([0, c.maxSelectedSports]) // --> Same axis range for each group
        // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
        .range([c.height, 0])
    }

    c.x = d3.scalePoint()
      .range([0, c.width - 79])
      .domain(c.dimensions);
    //})
  }

  drawAxis() {
    let c = this
    var yscale = d3.scaleLinear()
      .domain([0, c.maxSelectedSports])
      .range([c.height - c.spacing, 0]);

    // Draw the axis:
    var u = c.svg.selectAll(".parcoord-axis").remove()

    var u = c.svg.selectAll(".parcoord-axis").data(c.dimensions)


    // For each dimension of the dataset I add a 'g' element:
    u.enter()
      .append("g")
      .attr("class", "parcoord-axis")
      // I translate this element to its right position on the x axis
      .attr("transform", function (d) {

        //console.log(`translate(${c.x(d)})`)
        //let translateOf = c.dimensions.indexOf(d) > 0 ? c.width/c.dimensions.indexOf(d) : 0

        return `translate(${c.x(d)})`
        //return `translate(${translateOf})` 

      })
      // And I build the axis with the call function
      .each(d => {
        let laxis: any = d3.axisLeft(yscale).ticks(5)
        d3.selectAll(".parcoord-axis").call(laxis)
      })
      //.each(function (d) { d3.select(this).call(d3.axisLeft(yscale).ticks(5)); })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(d => d as string)
      .style("fill", "black")

    u.exit().remove()
  }

  update() {
    let c = this
    c.computeXY()
    c.drawAxis()


    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.

    var u = c.svg.selectAll(".parcoord-line").data(Object.values(c.stats))

    u
      .enter()
      .append('path')
      .attr('class', 'parcoord-line')
      .attr('class', 'line') // Add a new rect for each new elements
      .attr('id', d => 'line-'+d.name)
      .merge(u) // get the already existing elements as well
      .transition() // and apply changes to all of them
      //.duration(1000)
      .attr("d", d => c.path(d, c))
      .attr("fill", "#69b3a2")
      //.style("fill", "none")
      .style("stroke", "#0000ff")
      .style("opacity", 0.5)


    // If less group in the new dataset, I delete the ones not in use anymore
    u.exit().remove()








  }

}
