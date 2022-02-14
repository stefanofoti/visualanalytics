import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { PerformanceConf } from 'src/data/data';
import { DataService } from '../data.service';
import * as ld from "lodash";

import * as d3Scale from 'd3';
import * as d3Shape from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';
import { AnalyticsLoaderService } from '../analytics-loader.service';
import * as math from 'mathjs';

@Component({
  selector: 'app-perf-chart',
  templateUrl: './perf-chart.component.html',
  styleUrls: ['./perf-chart.component.css']
})
export class PerfChartComponent implements OnInit {

  private PERFCHART_COMPONENT_TAG = "PerformanceChart"


  dimensions: any
 

 
  private doc: any = {}
  private initialized = false

  //private height: number
  //private width: number

  private margin = { top: 20, right: 40, bottom: 30, left: 60 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>
  private medalsLine: d3Shape.Line<[number, number]>
  private countryLine: d3Shape.Line<[number, number]>
  private area: d3Shape.Area<[number, number]>

  public title = 'Performance Chart';


  private neverPlotted = true
  private performanceDict: any
  private boxPlotDict: any
  private medalsDict: any
  private boxPlotOutliers: any
  private q: any

  arrayFormData = []
  areaObjToDraw = {}
  lineObjToDraw = {}
  medalsArrayFormData = []


  constructor(private analyticsLoaderService: AnalyticsLoaderService, private dataService: DataService) {

    // this.subDataUpdated = dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.analyticsReadinessMessage.subscribe(message => this.analyticsDataReady(message))

  } 

  analyticsDataReady(message: any){
    if (message == "updated"){
      this.performanceDict = this.analyticsLoaderService.performanceDict
      this.boxPlotDict = this.analyticsLoaderService.boxPlotDict
      this.medalsDict = this.analyticsLoaderService.medalsDict
      this.boxPlotOutliers = this.analyticsLoaderService.boxPlotOutliers
      this.q = this.analyticsLoaderService.q
      this.arrayFormData = []
      this.areaObjToDraw = {}
      this.lineObjToDraw = {}
      this.medalsArrayFormData = []
      this.update()
    }

  }

  ngOnInit(): void {
    // this.width = document.getElementById("div_medalprogression").clientWidth;
    // this.height = document.getElementById("div_medalprogression").clientHeight;
    this.doc = document
    this.neverPlotted = true
    this.initialized = true
    // this.buildSvg();
    // this.addXandYAxis();
    // this.drawLineAndPath();
    //window.addEventListener("resize", this.resize.bind(this));
  }

  private getLabel(): string {
    let labelText = 'Time (seconds)'
    return labelText
  }

  private pushData(){
    this.areaObjToDraw["top-area"] = []
    this.areaObjToDraw["firstPercentile-area"] = []
    this.areaObjToDraw["secondPercentile-area"] = []
    this.areaObjToDraw["bottom-area"] = []

    let selectedCountries = ["GBR"]
    for( let country of selectedCountries){
      this.lineObjToDraw[country] = []
    }

    Object.keys(this.performanceDict).forEach(year => {
    
      for( let country of selectedCountries){
        if (this.performanceDict[year][country]){
          this.lineObjToDraw[country].push({
            "date": Number(year),
            "time": this.performanceDict[year][country]
          })
        }else{
          this.lineObjToDraw[country].push({
            "date": Number(year),
            "time": null
          })
        }
      }
    })

    console.log("test", this.lineObjToDraw)



    Object.keys(this.boxPlotDict).forEach(year => {

      let top 
      let topPercentile 
      let median 
      let bottomPercentile 
      let bottom 

      if (this.boxPlotDict[year].length == 1){
        top = this.boxPlotDict[year]
        topPercentile = this.boxPlotDict[year]
        median = this.boxPlotDict[year]
        bottomPercentile = this.boxPlotDict[year]
        bottom = this.boxPlotDict[year]
      }
      else{
        top = this.boxPlotDict[year][0]
        topPercentile = this.boxPlotDict[year][1]
        median = this.boxPlotDict[year][2]
        bottomPercentile = this.boxPlotDict[year][3]
        bottom = this.boxPlotDict[year][4]        
      }

      this.areaObjToDraw["top-area"].push({
        "date": Number(year),
        "percentileTop": top,
        "percentileBottom": topPercentile
      })
      this.areaObjToDraw["firstPercentile-area"].push({
        "date": Number(year),
        "percentileTop": topPercentile,
        "percentileBottom": median
      })
      this.areaObjToDraw["secondPercentile-area"].push({
        "date": Number(year),
        "percentileTop": median,
        "percentileBottom": bottomPercentile
      })
      this.areaObjToDraw["bottom-area"].push({
        "date": Number(year),
        "percentileTop": bottomPercentile,
        "percentileBottom": bottom
      })

      //////////////////////////////

      this.arrayFormData.push({
        "type": "top",
        "date": Number(year),
        "percentiles": top
      })
      this.arrayFormData.push({
        "type": "topPercentile",
        "date": Number(year),
        "percentiles": topPercentile
      })
      this.arrayFormData.push({
        "type": "median",
        "date": Number(year),
        "percentiles": median
      })
      this.arrayFormData.push({
        "type": "bottomPercentile",
        "date": Number(year),
        "percentiles": bottomPercentile
      })
      this.arrayFormData.push({
        "type": "bottom",
        "date": Number(year),
        "percentiles": bottom
      })
    });

    console.log(this.medalsDict)

    Object.keys(this.medalsDict).forEach(year => {
      
      this.medalsArrayFormData.push({
        "type": "gold",
        "date": Number(year),
        "time": this.medalsDict[year][0]
      })
      this.medalsArrayFormData.push({
        "type": "silver",
        "date": Number(year),
        "time": this.medalsDict[year][1]
      })
      this.medalsArrayFormData.push({
        "type": "bronze",
        "date": Number(year),
        "time": this.medalsDict[year][2]
      })
    })
    console.log(this.medalsArrayFormData)
  }

  private buildSvg() {
    this.width = PerformanceConf.width
    this.height = PerformanceConf.height

    if (this.neverPlotted) {
      this.neverPlotted = false

      this.svg = d3Sel.select("#div_performanceChart")
        .append("svg")
        .attr("id", "svg_performanceChart")
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 1200 420')
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    }
  }
  private addXandYAxis() {
    this.svg.selectAll('*').remove();
    let ticks = 10
    // range of data configuring

    let domain = d3Array.extent(this.arrayFormData, (d) => d.percentiles)
    if (this.q == true){
      let outliersDomainMax = 0
      Object.keys(this.boxPlotOutliers).forEach(year => {
        if (this.boxPlotOutliers[year].length>0){
          if (this.boxPlotOutliers[year][0]>outliersDomainMax){
            outliersDomainMax = this.boxPlotOutliers[year][0]
          }
        }
      })
      if (domain[1]<outliersDomainMax){
        domain[1]=outliersDomainMax
      }
    }
    
    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain(d3Array.extent(this.arrayFormData, (d) => d.date));

    this.y = d3.scalePow()
      .exponent(0.2)
      .range([this.height, 0])
      .domain(domain);

    let XaxisLabelX = this.width / 2;
    let XaxisLabelY = this.height + 35
    let YaxisLabelX = -40;
    let YaxisLabelY = this.height / 2
    let labelText = this.getLabel()

    this.svg.select("#ProgressionChartLabelX").remove()
    this.svg.append("g")
      .attr('id', "ProgressionChartLabelX")
      .attr('transform', 'translate(' + XaxisLabelX + ', ' + XaxisLabelY + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      .text("Year")
      .style("fill", "white");

    this.svg.select("#ProgressionChartLabelY").remove()
    this.svg.append("g")
      .attr('id', "ProgressionChartLabelY")
      .attr('transform', 'translate(' + YaxisLabelX + ', ' + YaxisLabelY + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text(labelText)
      .style("fill", "white");

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

    this.line = d3.line()
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.percentiles));

    this.medalsLine = d3.line()
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.time));

    this.countryLine = d3.line()
      .defined((d: any)=> d.time != null)
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.time))

    // Configuring line path

    this.area = d3.area()
        .x((d: any) => this.x(d.date))
        .y1((d: any) => this.y(d.percentileTop))
        .y0((d: any) => this.y(d.percentileBottom))

    let objToDraw = {}

    this.arrayFormData.forEach(afd => {
      let type = afd.type
      let list = objToDraw[type]
      if (!list) {
        list = []
        objToDraw[type] = list
      }
      list.push(afd)
    })

    let medalsObjToDraw = {}

    this.medalsArrayFormData.forEach(afd => {
      let type = afd.type
      let list = medalsObjToDraw[type]
      if (!list) {
        list = []
        medalsObjToDraw[type] = list
      }
      list.push(afd)
    })
    console.log(medalsObjToDraw)


    let areaColors = ["#004c6d", "#346888", "#5886a5", "#7aa6c2"]
    let counter = 0

    //// DRAW AREAS
    Object.keys(this.areaObjToDraw).forEach(k => {
      this.svg.append('path')
        .datum(this.areaObjToDraw[k])
        .attr("fill", _ =>{ 
          return areaColors[counter]
        })
        .attr('id', "area")
        .attr('d', this.area);
      counter+=1

    })

    let keys = Object.keys(objToDraw)
    this.svg.selectAll(".progression-line").remove()
    keys.forEach(k => {
      this.svg.append('path')
        .datum(objToDraw[k])
        .style("fill", "none")
        .attr("stroke", _=>{
          if(k == "median"){
            return "none"
          }
          return "none"
        })
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'progression-line')
        .attr('id', 'progression-' + k)
        .attr('d', this.line)
    })

    let medalColors = ["#d6af36", "#d7d7d7", "#a77044"]
    let medalKeys = Object.keys(medalsObjToDraw)
    let counter2 = -1

    //// DRAW MEDAL LINES

    medalKeys.forEach(k => {
      counter2 += 1
      this.svg.append('path')
        .datum(medalsObjToDraw[k])
        .style("fill", "none")
        .attr("stroke", _=>{
          return medalColors[counter2]
        })
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'progression-line')
        .attr('id', 'progression-' + k)
        .attr('d', this.medalsLine)
    })

    //// DRAW OUTLIERS
    if (this.q == true){
      Object.keys(this.boxPlotOutliers).forEach(year => {
        if (this.boxPlotOutliers[year].length != 0){
          for (let val of this.boxPlotOutliers[year]){
            this.svg.append("circle")
            .datum(this.boxPlotOutliers[year])
            .attr("stroke", "lightblue")
            .attr("fill", "lightblue")  
            .attr("r", 1)
            .attr("cx", this.x(year))
            .attr("cy", this.y(val))
            .attr('id', 'outlier')
          }
        }      
      });
    }

    ////// DRAW COUNTRIES LINES

     Object.keys(this.lineObjToDraw).forEach(k => {
      this.svg.append('path')
        .datum(this.lineObjToDraw[k])
        .style("fill", "none")
        .attr("stroke", _ =>{
          if(k == "GBR"){
            return "darkred"
          }else{
            return "darkblue"
          }
        })
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'progression-line')
        .attr('id', 'progression-' + k)
        .attr('d', this.countryLine)

      for (let year in this.lineObjToDraw[k]){
        if(this.lineObjToDraw[k][year].time!=null){
          this.svg.append('circle')
            .datum(this.lineObjToDraw[k])
            .attr("stroke", _ =>{
              if(k == "GBR"){
                return "red"
              }else{
                return "blue"
              }
            })
            .attr("fill",  _ =>{
              if(k == "GBR"){
                return "red"
              }else{
                return "blue"
              }
            })  
            .attr("r", 2)
            .attr("cx", this.x(this.lineObjToDraw[k][year].date))
            .attr("cy", this.y(this.lineObjToDraw[k][year].time))

        }
      }
    })



    

  }

  update() {
    if (this.initialized) {
      console.log("test", this.q)
      this.width = this.doc.getElementById("div_performanceChart").clientWidth;
      this.height = this.doc.getElementById("div_performanceChart").clientHeight;
      this.pushData();
      this.buildSvg();
      this.addXandYAxis();
      this.drawLineAndPath();
    }
  }

}
