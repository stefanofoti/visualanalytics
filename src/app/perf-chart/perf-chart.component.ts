import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { BothYears, bronzes, ColorScale, golds, Medal, MouseSelection, PreCheckedSports, PreCheckedSports2, PerformanceConf,ScatterConf, silvers, Sport, SummerYears, WinterYears } from 'src/data/data';
import { DataService } from '../data.service';
import { LoaderService } from '../loader.service';
import * as ld from "lodash";

import * as d3Scale from 'd3';
import * as d3Shape from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';
import { AnalyticsLoaderService } from '../analytics-loader.service';

@Component({
  selector: 'app-perf-chart',
  templateUrl: './perf-chart.component.html',
  styleUrls: ['./perf-chart.component.css']
})
export class PerfChartComponent implements OnInit {

  private PERFCHART_COMPONENT_TAG = "MedalProgression"


  dimensions: any
 

 
  private doc: any = {}
  private initialized = false

  private color: any

  //private height: number
  //private width: number

  private margin = { top: -10, right: 40, bottom: 30, left: 60 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;

  public title = 'Performance Chart';


  private neverPlotted = true

  private boxPlotDict: any

  arrayFormData = []


  constructor(private analyticsLoaderService: AnalyticsLoaderService, private dataService: DataService) {

    // this.subDataUpdated = dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.analyticsReadinessMessage.subscribe(message => this.analyticsDataReady(message))

  } 

  analyticsDataReady(message: any){
    if (message == "updated"){
      this.boxPlotDict = this.analyticsLoaderService.boxPlotDict

      console.log(this.boxPlotDict)
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
    let labelText = 'Time'
    return labelText
  }

  private pushData(){
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

    console.log(this.arrayFormData)

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
        .attr('viewBox', '0 0 790 420')
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    }
  }
  private addXandYAxis() {
    console.log(this.arrayFormData)
    let ticks = 10
    // range of data configuring
    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain(d3Array.extent(this.arrayFormData, (d) => d.date));

    this.y = d3Scale.scaleLinear()
      .range([this.height, 0])
      .domain(d3Array.extent(this.arrayFormData, (d) => d.percentiles));

    console.log(d3Array.extent(this.arrayFormData, (d) => d.percentiles))
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
      .text("Years")
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

    this.line = d3Shape.line()
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.percentiles));
    // Configuring line path

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

    let keys = Object.keys(objToDraw)



    this.svg.selectAll(".progression-line").remove()
    keys.forEach(k => {
      this.svg.append('path')
        .datum(objToDraw[k])
        .style("fill", "none")
        .attr("stroke", "#000000")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'progression-line')
        .attr('id', 'progression-' + k)
        .attr('d', this.line)


    })

  }

  update() {
    if (this.initialized) {
      this.width = this.doc.getElementById("div_performanceChart").clientWidth;
      this.height = this.doc.getElementById("div_performanceChart").clientHeight;
      this.pushData();
      this.buildSvg();
      this.addXandYAxis();
      this.drawLineAndPath();
    }
  }

}
