import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { bronzes, ColorScale, golds, Medal, MouseSelection, PreCheckedSports, PreCheckedSports2, silvers, Sport } from 'src/data/data';
import { DataService } from '../data.service';
import { LoaderService } from '../loader.service';
import * as ld from "lodash";

import * as d3Scale from 'd3';
import * as d3Shape from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';

@Component({
  selector: 'app-medal-progression-chart',
  templateUrl: './medal-progression-chart.component.html',
  styleUrls: ['./medal-progression-chart.component.css']
})
export class MedalProgressionChartComponent{

  private MEDALPROGRESSION_COMPONENT_TAG = "MedalProgression"


  dimensions: any
  private subDataReadiness: Subscription
  private subYearRangeChanged: Subscription
  private subSelectedMedals: Subscription
  private subSelectedSports: Subscription
  private subDataUpdated: Subscription
  private traditionSelectionSubscription: Subscription
  private htmlElement:HTMLElement;

  private isDataReady: boolean
  private spacing: number = 0

  private yearRange: number[]

  private selectedMedals: string[]
  private selectedSports: string[]
  private selectedCountries: string[]

  private color: any

  private countries: any = {}

  private stats: any
  private maxSelectedSports: number
  //private height: number
  //private width: number

  private margin = {top: 30, right: 40, bottom: 30, left: 60};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;

  public title = 'Line Chart';
  data: any[] = [
  {date: 10, value: 40},
  {date: 20, value: 93},
  {date: 30, value: 95},
  {date: 40, value: 130},
  {date: 50, value: 110},
  {date: 60, value: 120},
  {date: 70, value: 129},
  {date: 80, value: 107},
  {date: 90, value: 140},
];


  private neverPlotted = true

  currentSelected: any = {}
  currentCountryName: string
  currentCountryNoc: string
  selectedTraditionNoc: string
  arrayFormData = []
  justChina = []
  chinaYears = [1984, 1988, 1992, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016]


  constructor(private loaderService: LoaderService, private dataService: DataService) {

    this.subDataUpdated = dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.yearlyDataMessage.subscribe(message => this.yearlyDataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))
    this.traditionSelectionSubscription = this.dataService.traditionSelectionMessage.subscribe(message => {
      this.selectedTraditionNoc = message.currentlySelected ? message.noc : undefined
    })

  }

  onMouseSelection(message: MouseSelection) {
    if (message.source && message.source !== this.MEDALPROGRESSION_COMPONENT_TAG) {
      console.log("onMouseSelection parcoords")
      console.log(message)
      //message.currentlySelected ? this.highlight(null, message.noc, this) : this.doNotHighlight(null, message.noc, this)

    }
  }

  dataReady(message): any {
    if (message && message.length == 7) {
      this.stats = Object.values(message[0])
      this.maxSelectedSports = message[2]
      this.dimensions = message[3]
      if (this.dimensions.length == 0) this.dimensions = PreCheckedSports2
      this.selectedMedals = message[4]
      this.selectedCountries = message[6]
      if (this.selectedCountries.length > 0) {
        this.stats = Object.values(this.stats).filter(s => this.selectedCountries.includes((s as any).name))
      }
      this.countries = this.loaderService.countries
      this.isDataReady = true
      //this.neverPlotted && this.firstPlot()
      //this.update()
    }
  }

  yearlyDataReady(message): any {
    let m = message
    let yearlyData = {}

    Object.keys(m).forEach(element => { 
      let noc = m[element][0]
      let year = m[element][1]
      let sex = m[element][3]
      let medals = m[element][4]

      if (yearlyData[noc]){
        if (yearlyData[noc][year]){
          if (yearlyData[noc][year][sex]){
            yearlyData[noc][year][sex] += medals
            yearlyData[noc][year].total += medals
          }
          else{
            yearlyData[noc][year][sex] = medals
            yearlyData[noc][year].total += medals

          }
        }
        else{
          yearlyData[noc][year] = {}
          yearlyData[noc][year][sex] = medals
          yearlyData[noc][year].total = medals
        }
      }
      else {
        yearlyData[noc] = {}
        yearlyData[noc][year] = {}
        yearlyData[noc][year][sex] = medals
        yearlyData[noc][year].total = medals
      }
      
    });
    console.log("yearlydata", yearlyData)

    let q = this.loaderService.query
    this.arrayFormData = []


    Object.keys(yearlyData).forEach(noc => {
      if(q.medalsByGdp){
        if (Object.keys(this.loaderService.avgGdpDict).includes(noc)){
          Object.keys(yearlyData[noc]).forEach(year => {
            this.arrayFormData.push({
              "noc": noc,
              "date": Number(year),
              "medals":yearlyData[noc][year].total * 10000000000
            })
          });
        }  
      } 
      else if (q.medalsByPop){
        if (Object.keys(this.loaderService.avgPopDict).includes(noc)){
          Object.keys(yearlyData[noc]).forEach(year => {
            this.arrayFormData.push({
              "noc": noc,
              "date": Number(year),
              "medals":yearlyData[noc][year].total * 100000
            })
          });
        }  

      }      
      else {
        Object.keys(yearlyData[noc]).forEach(year => {
          this.arrayFormData.push({
            "noc": noc,
            "date": Number(year),
            "medals":yearlyData[noc][year].total
          })
        });

      } 
    });
    console.log("myData", this.arrayFormData)
    console.log("theirData", this.data)
    this.justChina = []
    this.arrayFormData.forEach(elem => {
      if (elem.noc =="AUS"){
        this.justChina.push(elem)
      }
      
    });
    console.log("ChinaData", this.justChina)
    // this.neverPlotted && this.firstPlot()
    this.update()



  }

  ngOnInit(): void {
    this.width = document.getElementById("div_medalprogression").clientWidth;
    this.height = document.getElementById("div_medalprogression").clientHeight;
    this.neverPlotted = true
    // this.buildSvg();
    // this.addXandYAxis();
    // this.drawLineAndPath();
    //window.addEventListener("resize", this.resize.bind(this));
  }

  // resize(): void {
  //   d3.select("#svg_MedalsProgressionChart").remove()
  //   this.neverPlotted = true
  //   this.update()
  // }

  private buildSvg() {
    if (this.neverPlotted){
      this.neverPlotted = false

      this.width = this.width - this.margin.left - this.margin.right;
      this.height = this.height - this.margin.top - this.margin.bottom;

      this.svg = d3Sel.select("#div_medalprogression")
      .append("svg")
      .attr("id", "svg_medalprogression")
      .attr('width', '100%')
      .attr('height', '100%')
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    }
  }
  private addXandYAxis() {
    let q = this.loaderService.query
    let ticks = 10
    if (q){
      ticks = (q.end-q.start)/4
    }
    // range of data configuring
    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain(d3Array.extent(this.arrayFormData, (d) => d.date ));

    this.y = d3Scale.scaleLinear()
      .range([this.height, 0])
      .domain(d3Array.extent(this.arrayFormData, (d) => d.medals ));

    // Configure the X Axis
    this.svg.select("#Xaxis").remove()
    this.svg.select("#yAxis").remove()
    this.svg.append('g')
      .attr('id', "Xaxis")
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x).ticks(ticks));
    // Configure the Y Axis
    this.svg.append('g')
        .attr('id', "yAxis")
        .attr('class', 'axis axis--y')
        .call(d3Axis.axisLeft(this.y));
  }
  private drawLineAndPath() {
    this.line = d3Shape.line()
        .x( (d: any) => this.x(d.date) )
        .y( (d: any) => this.y(d.medals) );
        console.log("my line", this.line)
    // Configuring line path
    this.svg.select("#china").remove()
    this.svg.append('path')
      .datum(this.arrayFormData)
      .style("fill","none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr('class', 'line')
      .attr('id', 'china')
      .attr('d',  this.line)
      .attr("stroke-width",5);
  }




  update() {
    this.buildSvg();
    this.addXandYAxis();
    this.drawLineAndPath();
//   firstPlot(): void {
//     if (this.neverPlotted) {
//       this.neverPlotted = false
//       // let data = Object.values(stats)
//       let c = this

//       // set the dimensions and margins of the graph
//       const margin = { top: 30, right: 20, bottom: 30, left: 50 }
//       this.width = document.getElementById("div_MedalsProgressionChart").clientWidth;
//       this.height = document.getElementById("div_MedalsProgressionChart").clientHeight;
//       console.log("myheight", this.height)

//       this.width = this.width - margin.left - margin.right
//       this.height = this.height - margin.top - margin.bottom

      
//       this.color = ColorScale

//       // append the svg object to the body of the page
//       this.svg = d3Sel.select("#div_MedalsProgressionChart")
//         .append("svg")
//         .attr("id", "svg_MedalsProgressionChart")
//         .attr("height", "100%")
//         .attr("width", "100%")
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//     }
//     this.x = d3.scaleTime().range([0, this.width]);
//     this.y = d3.scaleLinear().range([this.height, 0])
  
//     line = d3.line()
//       .x(function (d) {
//         return this.x(d.year);
//       })
//       .y(function (d) {
//         return y(d.sales);
//       });

//   }
//   path(d, c) {

//     console.log("path d", d)
//   }

//   // computeXY() {
//   //   let c = this
//   //   c.x = d3.scaleTime().range([0, c.width]);
//   //   c.y = d3.scaleLinear().range([c.height, 0])
//   // }


//   getLabel(): string {
//     let labelText = 'Medals'
//     let query = this.loaderService.query

//     query.tradition && (labelText += " (tradition)")
//     query.normalize && (labelText+= " normalized")

//     query.medalsByPop && (labelText += "/country population")
//     query.medalsByGdp && (labelText += "/gdp")

//     return labelText
//   }

//   drawAxis() {
//     let c = this

//     let axisLabelX = -30;
//     let axisLabelY = this.height/2
//     let labelText = this.getLabel()
//     c.svg.select("#MedalProgressionChartLabel").remove()
//     c.svg.append("g")
//       .attr('id', "MedalProgressionChartLabel")
//       .attr('transform', 'translate(' + axisLabelX + ', ' + axisLabelY + ')')
//       .append('text')
//       .attr('text-anchor', 'middle')
//       .attr('transform', 'rotate(-90)')
//       .text(labelText)
//       .style("fill", "white");

//     var yscale = d3.scaleLinear()
//       .domain([0, c.width])
//       .range([c.height - c.spacing, 0]);

//     // Draw the axis:
//     var u = c.svg.selectAll(".MedalProgression-axis").remove()

//     var u = c.svg.selectAll(".MedalProgression-axis").data(1)

//     // For each dimension of the dataset I add a 'g' element:
//     u.enter()
//       .append("g")
//       .attr("class", "MedalProgression-axis")
//       //.merge(u)
//       // I translate this element to its right position on the x axis
//       .attr("transform", function (d) {
//         return `translate(${0})`
//       })

//       .append("text")

//       .style("text-anchor", "start")
//       .attr("transform", "rotate(-75)")
//       .attr("y", -9)
//       .text(d => {
//         typeof d === "number" && Number(d)%1 !== 0 && (d=Number(d).toFixed(4))
//         return d as string
//       })
//       .style("fill", "white");

//     u.exit().remove()
//   }

//   // path(d, c) {
//   //   if (c.dimensions.length === 1) {
//   //     let p = c.dimensions[0]
//   //     let totMedals = 0
//   //     totMedals += d[p].total
//   //     return d3.line()([[0, c.y[p](totMedals)], [c.x(p) * 2, c.y[p](totMedals)]])
//   //   }
//   //   return d3.line()(c.dimensions.map(p => {
//   //     let totMedals = 0
//   //     // c.selectedMedals.includes(golds) && (totMedals += d[p].golds)
//   //     // c.selectedMedals.includes(bronzes) && (totMedals += d[p].bronzes)
//   //     // c.selectedMedals.includes(silvers) && (totMedals += d[p].silvers)
//   //     totMedals += d[p].total
//   //     let x = c.x(p) || 0
//   //     let y = c.y[p](totMedals) || 0 
//   //     return [x, y - c.spacing];
//   //   }));
//   // }

//   // computeXY() {
//   //   let c = this
//   //   c.y = {}
//   //   for (let i in c.dimensions) {
//   //     let name = c.dimensions[i]
//   //     c.y[name] = d3.scaleSqrt()
//   //       .domain([0, c.maxSelectedSports]) // --> Same axis range for each group
//   //       // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
//   //       .range([c.height, 0])
//   //   }

//   //   c.x = d3.scalePoint()
//   //     .range([0, c.width - 50])
//   //     .domain(c.dimensions);
//   //   //})
//   // }

//   // drawAxis() {
//   //   let c = this

//   //   let axisLabelX = -30;
//   //   let axisLabelY = this.height/2
//   //   let labelText = this.getLabel()
//   //   c.svg.select("#ParcoordChartLabel").remove()
//   //   c.svg.append("g")
//   //     .attr('id', "ParcoordChartLabel")
//   //     .attr('transform', 'translate(' + axisLabelX + ', ' + axisLabelY + ')')
//   //     .append('text')
//   //     .attr('text-anchor', 'middle')
//   //     .attr('transform', 'rotate(-90)')
//   //     .text(labelText)
//   //     .style("fill", "white");

//   //   var yscale = d3.scaleSqrt()
//   //     .domain([0, c.maxSelectedSports])
//   //     .range([c.height - c.spacing, 0]);

//   //   // Draw the axis:
//   //   var u = c.svg.selectAll(".parcoord-axis").remove()

//   //   var u = c.svg.selectAll(".parcoord-axis").data(c.dimensions)

//   //   // For each dimension of the dataset I add a 'g' element:
//   //   u.enter()
//   //     .append("g")
//   //     .attr("class", "parcoord-axis")
//   //     //.merge(u)
//   //     // I translate this element to its right position on the x axis
//   //     .attr("transform", function (d) {

//   //       //console.log(`translate(${c.x(d)})`)
//   //       //let translateOf = c.dimensions.indexOf(d) > 0 ? c.width/c.dimensions.indexOf(d) : 0

//   //       return `translate(${c.x(d)})`
//   //       //return `translate(${translateOf})` 

//   //     })
//   //     // And I build the axis with the call function
//   //     .each(d => {
//   //       let laxis: any = d3.axisLeft(yscale).ticks(5)
//   //       d3.selectAll(".parcoord-axis").call(laxis)
//   //     })
//   //     //.each(function (d) { d3.select(this).call(d3.axisLeft(yscale).ticks(5)); })
//   //     // Add axis title
//   //     .append("text")

//   //     .style("text-anchor", "start")
//   //     .attr("transform", "rotate(-75)")
//   //     .attr("y", -9)
//   //     .text(d => {
//   //       typeof d === "number" && Number(d)%1 !== 0 && (d=Number(d).toFixed(4))
//   //       return d as string
//   //     })
//   //     .style("fill", "white");

//   //   u.exit().remove()
//   //}
  


//   highlight(ev, d, c) {

//     if (typeof (d) === 'string') {
//       c.currentCountryNoc = d
//       d && this.countries[d] && (c.currentCountryName = this.countries[d].name)
//     } else {
      
//       if(d.name == "BORDER"){
//         c.currentCountryName = this.countries[this.selectedTraditionNoc].name
//         c.currentCountryNoc = this.selectedTraditionNoc        
//       } else {
//         c.currentSelected = d
//         c.currentCountryName = this.countries[c.currentSelected.name] && this.countries[c.currentSelected.name].name || ""
//         c.currentCountryNoc = c.currentSelected.name
//       }
//       this.dataService.updateMouseSelection({
//         currentlySelected: true,
//         noc: c.currentCountryNoc,
//         source: this.MEDALPROGRESSION_COMPONENT_TAG
//       })
//     }
//     d3.selectAll(".parcoord-line")
//       .transition().duration(200)
//       .style("opacity", "0.07")
//     // Second the hovered specie takes its color
//     d3.select("#line-" + c.currentCountryNoc)
//       .transition().duration(200)
//       .style("opacity", "1")
//     d3.select("#line-" + this.selectedTraditionNoc)
//     .transition().duration(200)
//     .style("opacity", "0.5")
//     d3.select("#line-" + "BORDER")
//     .transition().duration(200)
//     .style("opacity", "0.5")
//     if (d.name == "BORDER" || d.name == this.selectedTraditionNoc) {
//       d3.select("#line-" + "BORDER")
//       .transition().duration(200)
//       .style("opacity", "1")
//     }
//   }

//   // Unhighlight
//   doNotHighlight(ev, d, c) {
//     if (typeof d !== 'string') {
//       this.dataService.updateMouseSelection({
//         currentlySelected: false,
//         noc: c.currentCountryNoc,
//         source: this.MEDALPROGRESSION_COMPONENT_TAG
//       })
//     }
//     d3.selectAll(".parcoord-line")
//       .transition().duration(200).delay(200)
//       .style("opacity", 1)
//     if (this.selectedTraditionNoc){
//       d3.select("#line-" + this.selectedTraditionNoc)
//       .transition().duration(200)
//       .style("opacity", "1")
//       d3.select("#line-" + "BORDER")
//       .transition().duration(200)
//       .style("opacity", "1")
//     }

//     c.currentSelected = {}
//     c.currentCountryName = ""
//     c.currentCountryNoc = ""

//   }


//   update() {
//     let c = this
//     c.computeXY()
//     c.drawAxis()


//     // let statsCopy = c.stats

//     // if (this.selectedTraditionNoc) {
//     //   let index = statsCopy.findIndex(e => e.name === this.selectedTraditionNoc)
//     //   let selectedLine = ld.cloneDeep(statsCopy[index])
//     //   let borderLine = ld.cloneDeep(statsCopy[index])
//     //   borderLine.name = "BORDER"
//     //   statsCopy.splice(index, 1)
//     //   statsCopy.push(borderLine, selectedLine)
//     // }

//     // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
//     c.svg.selectAll(".MedalProgression-line").remove()
//     c.svg.selectAll(".MedalProgression-line")
//       .data(this.arrayFormData)
//       .join("path")
//       .attr("class", "MedalProgression-line")
//       .attr('id', d => 'line-' + d.noc)
//       //.on("mouseover", (event, d) => this.highlight(event, d, c))
//       //.on("mouseleave", (event, d) => this.doNotHighlight(event, d, c))


//       var u = c.svg.selectAll(".MedalProgression-line").data(this.arrayFormData)

//     u
//       .enter()
//       .append('path')
//       .attr('class', 'MedalProgression-line')
//       //.attr('class', 'line') // Add a new rect for each new elements
//       .attr('id', d => 'line-' + d.noc)
//       .merge(u) // get the already existing elements as well
//       .transition() // and apply changes to all of them
//       .attr("d", d => line(this.arrayFormData))
//       .style("fill", "#69b3a2")

//     // If less group in the new dataset, I delete the ones not in use anymore
//     u.exit().remove()
//   }
// }
}
}
