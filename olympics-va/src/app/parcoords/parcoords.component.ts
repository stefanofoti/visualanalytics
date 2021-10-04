import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { bronzes, golds, Medal, MouseSelection, PreCheckedSports, PreCheckedSports2, silvers, Sport } from 'src/data/data';
import { DataService } from '../data.service';
import { LoaderService } from '../loader.service';
import * as ld from "lodash";

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
  private traditionSelectionSubscription: Subscription

  private isDataReady: boolean
  private spacing: number = 0

  private yearRange: number[]

  private selectedMedals: string[]
  private selectedSports: string[]
  private selectedCountries: string[]

  private color: any

  private countries: any = {}

  private x: any
  private y: any
  private svg: any

  private stats: any
  private maxSelectedSports: number
  private height: number
  private width: number


  private neverPlotted = true

  currentSelected: any = {}
  currentCountryName: string
  currentCountryNoc: string
  selectedTraditionNoc: string


  constructor(private loaderService: LoaderService, private dataService: DataService) {
    //this.subYearRangeChanged = dataService.changedYearRangeMessage.subscribe(message => this.onYearRangeChanged(message))
    // this.subDataReadiness = dataService.olympycsReadinessMessage.subscribe(message => this.dataReady(message))
    // this.subSelectedMedals = dataService.selectedMedalsMessage.subscribe(message => this.onSelectedMedalsChanged(message))
    // this.subSelectedSports = dataService.selectedSportsMessage.subscribe(message => this.onSelectedSportsChanged(message))
    this.subDataUpdated = dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))
    this.traditionSelectionSubscription = this.dataService.traditionSelectionMessage.subscribe(message => {
      this.selectedTraditionNoc = message.currentlySelected ? message.noc : undefined
    })

  }

  onMouseSelection(message: MouseSelection) {
    if (message.source && message.source !== ParcoordsComponent.name) {
      console.log("onMouseSelection parcoords")
      console.log(message)
      message.currentlySelected ? this.highlight(null, message.noc, this) : this.doNotHighlight(null, message.noc, this)

    }
  }

  dataReady(message): any {
    console.log("current message: ", message)
    if (message && message.length == 7) {
      this.stats = Object.values(message[0])
      this.maxSelectedSports = message[2]
      this.dimensions = message[3]
      // if (this.dimensions.length == 0) this.dimensions = [ "Art Competitions", "Alpine Skiing", "Handball", "Weightlifting", "Wrestling", "Luge", "Water Polo", "Hockey", "Rowing", "Bobsleigh", "Fencing", "Equestrianism", "Shooting", "Boxing", "Taekwondo", "Cycling", "Diving", "Canoeing", "Tennis", "Modern Pentathlon", "Figure Skating", "Golf", "Softball", "Archery", "Volleyball" ]
      if (this.dimensions.length == 0) this.dimensions = PreCheckedSports2
      //if (this.dimensions.length > 30) this.dimensions.splice(30)
      this.selectedMedals = message[4]
      this.selectedCountries = message[6]
      if (this.selectedCountries.length > 0) {
        this.stats = Object.values(this.stats).filter(s => this.selectedCountries.includes((s as any).name))
      }
      this.countries = this.loaderService.countries
      this.isDataReady = true
      this.neverPlotted && this.firstPlot()
      this.update()
    }
  }

  onSelectedMedalsChanged(message: Medal[]) {

    this.selectedMedals = []
    message.map(med => {
      med.isChecked && this.selectedMedals.push(med.id)
    })
    if (this.isDataReady) {
      //this.getData()
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
      //this.getData()
      this.update()
    }
  }

  onYearRangeChanged(newRange: number[]) {
    this.yearRange = newRange
    if (this.isDataReady) {
      //this.getData()
      this.update()
    }
  }

  ngOnInit(): void {
  }

  // getData(): void {
  //   console.log(this.isDataReady)
  //   if (!this.isDataReady) {
  //     return
  //   }
  //   let m
  //   [this.stats, , m] = this.loaderService.computeMedalsByNationInRange(this.yearRange[0], this.yearRange[1], this.selectedMedals, PreCheckedSports2, false, false)
  //   this.maxSelectedSports = m as number
  // }

  firstPlot(): void {
    if (this.neverPlotted) {
      this.neverPlotted = false
      // let data = Object.values(stats)
      let c = this
      // set the dimensions and margins of the graph
      const margin = { top: 60, right: 50, bottom: 10, left: 30 }
      // this.width = 1200 - margin.left - margin.right
      this.height = 300 - margin.top - margin.bottom

      this.color = d3.scaleOrdinal()
        .domain(["Asia", "Africa", "North America", "South America", "Europe", "Oceania"])
        .range(["#0085c7", "#ff4f00", "#f4c300", "#f4c300", "#7851A9", "#009f3d"])

      // append the svg object to the body of the page
      this.svg = d3.select("#div_parcoord")
        .append("svg")
        .attr("id", "svg_parcoords")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr('viewBox', '0 0 2080 300')
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      this.width = document.getElementById("svg_parcoords").clientWidth
      //this.height = document.getElementById("svg_parcoords").clientHeight
      //this.computeXY()
      //this.drawAxis()

      //this.svg
      // .on("mouseover", (event, d) => this.highlight(event, d, c))
      // .on("mouseleave", (event, d) => this.doNotHighlight(event, d, c))


      // Draw the lines
      // this.svg.selectAll("myPath")
      //   .data(c.stats)
      //   .join("path")
      //   .attr("class", d => {
      //     let x: any = d
      //     return "line parcoord-line"
      //   }) // 2 class for each line: 'line' and the group name
      //   .attr("d", d => this.path(d, c))
      //   .attr('id', d => 'line-' + d.name)
      //   .style("fill", "none")
      //   // .style("stroke", d => this.color(this.countries[d.name] && this.countries[d.name].continent))
      //   .style("opacity", 0.5)
      //   .on("mouseover", (event, d) => this.highlight(event, d, c))
      //   .on("mouseleave", (event, d) => this.doNotHighlight(event, d, c))
    }

  }


  path(d, c) {
    if (c.dimensions.length === 1) {
      let p = c.dimensions[0]
      let totMedals = 0
      totMedals += d[p].total
      return d3.line()([[0, c.y[p](totMedals)], [c.x(p) * 2, c.y[p](totMedals)]])
    }
    return d3.line()(c.dimensions.map(p => {
      let totMedals = 0
      // c.selectedMedals.includes(golds) && (totMedals += d[p].golds)
      // c.selectedMedals.includes(bronzes) && (totMedals += d[p].bronzes)
      // c.selectedMedals.includes(silvers) && (totMedals += d[p].silvers)
      totMedals += d[p].total
      return [c.x(p), c.y[p](totMedals) - c.spacing];
    }));
  }

  computeXY() {
    let c = this
    c.y = {}
    for (let i in c.dimensions) {
      let name = c.dimensions[i]
      c.y[name] = d3.scaleSqrt()
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
    var yscale = d3.scaleSqrt()
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

      .style("text-anchor", "start")
      .attr("transform", "rotate(-70)")
      .attr("y", -9)
      .text(d => d as string)
      .style("fill", "rgb(182, 182, 182)")

    u.exit().remove()
  }


  highlight(ev, d, c) {

    if (typeof (d) === 'string') {
      c.currentCountryNoc = d
      d && this.countries[d] && (c.currentCountryName = this.countries[d].name)
    } else //if(d.name !== "BORDER")
    {
      c.currentSelected = d
      c.currentCountryName = this.countries[c.currentSelected.name].name
      c.currentCountryNoc = c.currentSelected.name

      this.dataService.updateMouseSelection({
        currentlySelected: true,
        noc: c.currentCountryNoc,
        source: ParcoordsComponent.name
      })

    }

    // TEMP ------------
    // let selected_specie: string = d.Species
    // let colorNumb: any = color(selected_specie)
    // first every group turns grey
    d3.selectAll(".parcoord-line")
      .transition().duration(200)
      //.style("stroke", "lightgrey")
      .style("opacity", "0.02")
    // Second the hovered specie takes its color
    d3.select("#line-" + c.currentCountryNoc)
      .transition().duration(200)
      //.style("stroke", /*color(selected_specie)*/ "#00ffff")
      .style("opacity", "1")
  }

  // Unhighlight
  doNotHighlight(ev, d, c) {
    if (typeof d !== 'string') {
      this.dataService.updateMouseSelection({
        currentlySelected: false,
        noc: c.currentCountryNoc,
        source: ParcoordsComponent.name
      })
    }
    d3.selectAll(".parcoord-line")
      .transition().duration(200).delay(200)
      //.style("stroke", "#0000ff")
      .style("opacity", d => {
        if (c.currentCountryNoc === this.selectedTraditionNoc) return 1
        return 0.7
      })

    c.currentSelected = {}
    c.currentCountryName = ""
    c.currentCountryNoc = ""

  }


  update() {
    let c = this
    c.computeXY()
    c.drawAxis()


    let statsArray = c.stats

    /*if (this.selectedTraditionNoc) {
      let index = c.stats.findIndex(e => e.name === this.selectedTraditionNoc)
      let newLine = ld.cloneDeep(c.stats[index])
      newLine.name = "BORDER"
      statsArray = [c.stats.splice(index, 0, newLine)]
    }*/

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    c.svg.selectAll(".parcoord-line")
      .data(statsArray)
      .join("path")
      .attr("class", "parcoord-line")
      .attr('id', d => 'line-' + d.name)
      .on("mouseover", (event, d) => this.highlight(event, d, c))
      .on("mouseleave", (event, d) => this.doNotHighlight(event, d, c))


    var u = c.svg.selectAll(".parcoord-line").data(c.stats)

    u
      .enter()
      .append('path')
      .attr('class', 'parcoord-line')
      //.attr('class', 'line') // Add a new rect for each new elements
      .attr('id', d => 'line-' + d.name)
      .merge(u) // get the already existing elements as well
      .transition() // and apply changes to all of them
      //.duration(1000)
      .attr("d", d => c.path(d, c))
      //.attr("fill", "#69b3a2")
      .attr("stroke-width", d => {
        if (d.name === this.selectedTraditionNoc) return 5
        if (d.name === "BORDER") return 9
        return 3
      })
      .style("fill", "none")
      .style("stroke", d => { 
        if(d.name === "BORDER") {
          return "#000000"
        }
        return this.color(this.countries[d.name] && this.countries[d.name].continent) })
      //.style("stroke", "#0000ff")
      .style("opacity", d => {
        if (d.name === this.selectedTraditionNoc) return 1
        return 0.7
      })




    // If less group in the new dataset, I delete the ones not in use anymore
    u.exit().remove()







  }

}
