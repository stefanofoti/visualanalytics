import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { BothYears, bronzes, ColorScale, golds, Medal, MouseSelection, PreCheckedSports, PreCheckedSports2, ScatterConf, silvers, Sport, SummerYears, WinterYears } from 'src/data/data';
import { RatioConf } from 'src/data/data';
import { DataService } from '../data.service';
import * as ld from "lodash";

import * as d3Scale from 'd3';
import * as d3Shape from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';
import { AnalyticsLoaderService } from '../analytics-loader.service';
import * as math from 'mathjs';
import { color } from 'd3';


@Component({
  selector: 'app-ratio',
  templateUrl: './ratio.component.html',
  styleUrls: ['./ratio.component.css']
})
export class RatioComponent implements OnInit {

  private RATIOCHART_COMPONENT_TAG = "RatioChart"


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

  public title = 'Ratio Chart';


  private neverPlotted = true
  private ratioDict: any
  private boxPlotDict: any
  private medalsDict: any
  private boxPlotOutliers: any
  private q: any

  private selectedAreas = []

  private sizes = {
    "circle": 2,
    "circle-width": 1,
    "country-line": 4,
    "country-border": 5,
    "medal-line": 2,
    "circle-outlier": 1
  }

  private zoomScale: number = 1

  arrayFormData = []
  areaObjToDraw = {}
  lineObjToDraw = {}
  areaLinesObjToDraw = {}
  medalsArrayFormData = []


  constructor(private analyticsLoaderService: AnalyticsLoaderService, private dataService: DataService) {

    // this.subDataUpdated = dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.analyticsReadinessMessage.subscribe(message => this.analyticsDataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))

  } 

  onMouseSelection(message: MouseSelection) {
    if (message.source && message.source !== this.RATIOCHART_COMPONENT_TAG) {
      message.currentlySelected ? this.highlight(message.noc, this, message.source) : this.doNotHighlight(message.noc, this, message.source)
    }
  }

  analyticsDataReady(message: any){
    if (message == "updated"){
      this.ratioDict = this.analyticsLoaderService.ratioDict
      this.boxPlotDict = this.analyticsLoaderService.ratioBoxPlotDict
      this.boxPlotOutliers = this.analyticsLoaderService.ratioBoxPlotOutliers
      this.medalsDict = this.analyticsLoaderService.medalsDict
      this.q = this.analyticsLoaderService.q
      this.arrayFormData = []
      this.areaObjToDraw = {}
      this.lineObjToDraw = {}
      this.areaLinesObjToDraw = {}
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
    let labelText = 'Efficency'
    return labelText
  }

  private pushData(){
    this.areaObjToDraw["top-area"] = []
    this.areaObjToDraw["firstPercentile-area"] = []
    this.areaObjToDraw["secondPercentile-area"] = []
    this.areaObjToDraw["bottom-area"] = []

    let selectedCountries = []
    let selectedAreaCountries = []
    if (this.q.countries){
      selectedCountries = this.q.countries
    }
    for( let country of selectedCountries){
      this.lineObjToDraw[country] = []
    }

    if (this.q.areaCountries){
      selectedAreaCountries = this.q.areaCountries
    }
    for( let country of selectedAreaCountries){
      this.areaLinesObjToDraw[country] = []
    }


    Object.keys(this.ratioDict).forEach(year => {

      if(!this.q || this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
    
        for( let country of selectedCountries){
          if (this.ratioDict[year][country]){
            this.lineObjToDraw[country].push({
              "date": Number(year),
              "time": this.ratioDict[year][country]
            })
          }else{
            this.lineObjToDraw[country].push({
              "date": Number(year),
              "time": null
            })
          }
        }

        for( let country of selectedAreaCountries){
          if (this.ratioDict[year][country]){
            this.areaLinesObjToDraw[country].push({
              "date": Number(year),
              "time": this.ratioDict[year][country]
            })
          }else{
            this.areaLinesObjToDraw[country].push({
              "date": Number(year),
              "time": null
            })
          }
        }
      }
    })




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
  }

  private buildSvg() {
    this.width = RatioConf.width
    this.height = RatioConf.height

    if (this.neverPlotted) {
      this.neverPlotted = false

      this.svg = d3Sel.select("#div_ratioChart")
        .append("svg")
        .attr("id", "svg_ratioChart")
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 1900 323')
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    }
  }
  private addXandYAxis() {
    this.svg.selectAll('*').remove();
    let ticks = 10
    // range of data configuring
    let domain = d3Array.extent(this.arrayFormData, (d) => d.percentiles)  
    let xDomain = [2004, 2020]
    if( this.q.yearStart && this.q.yearEnd){
      xDomain = [this.q.yearStart, this.q.yearEnd]
    }  
    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain(xDomain);

    this.y = d3.scalePow()
      .exponent(1/3)
      .range([this.height, 0])
      .domain(domain);

    let XaxisLabelX = this.width / 2;
    let XaxisLabelY = this.height + 35
    let YaxisLabelX = -40;
    let YaxisLabelY = -10
    let labelText = this.getLabel()

    this.svg.select("#RatioChartLabelX").remove()
    this.svg.append("g")
      .attr('id', "RatioChartLabelX")
      .attr('transform', 'translate(' + XaxisLabelX + ', ' + XaxisLabelY + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      //.text("Year")
      .style("fill", "white");

    this.svg.select("#RatioChartLabelY").remove()
    this.svg.append("g")
      .attr('id', "RatioChartLabelY")
      .attr('transform', 'translate(' + YaxisLabelX + ', ' + YaxisLabelY + ')')
      .append('text')
      .attr('text-anchor', 'top')
      //.attr('transform', 'rotate(-90)')
      .text(labelText)
      .style("fill", "white")
      .style("font-size", "large");

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
  private drawLineAndPath(c) {

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


    let areaColors = ["#ede2bc", "#cbbe8b", "#a89b5c","#86792e"]
    let counter = 0

    ///// BRUSHING

    let brush = d3.brushX()      
    .extent( [ [0,0], [this.width,this.height] ] )
    .on("end", _ => this.selectionToRange(this))   

    this.svg.append("g")
      .attr("class", "brush")
      .attr('id', "brush")
      .call(brush)

    
    //// DRAW AREAS
    Object.keys(this.areaObjToDraw).forEach(k => {
      this.svg.append('path')
        .datum(this.areaObjToDraw[k])
        .attr("fill", _ =>{ 
          return areaColors[counter]
        })
        .attr('id', "area")
        .attr('d', this.area)
        .on('click',_ => this.onClick(k, this, this.RATIOCHART_COMPONENT_TAG))
      counter+=1

    })

    let keys = Object.keys(objToDraw)
    this.svg.selectAll(".ratio-line").remove()
    keys.forEach(k => {
      this.svg.append('path')
        .datum(objToDraw[k])
        .style("fill", "none")
        .attr("stroke", _=>{
          if(k == "median"){
            return "red"
          }
          return "none"
        })
        .style("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'ratio-line')
        .attr('id', 'ratio-' + k)
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
        .style("stroke-width", this.sizes["medal-line"])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'ratio-line')
        .attr('id', 'ratio-' + k)
        .attr('d', this.medalsLine)
    })

    //// DRAW OUTLIERS
    if (this.q.showOutliers == true){
      Object.keys(this.boxPlotOutliers).forEach(year => {
        if (this.boxPlotOutliers[year].length != 0){
          for (let val of this.boxPlotOutliers[year]){
            this.svg.append("circle")
            .datum(this.boxPlotOutliers[year])
            .attr("stroke", "#86792e")
            .attr("fill", "#86792e")  
            .attr("r", this.sizes["circle-outlier"])
            .attr("cx", this.x(year))
            .attr("cy", this.y(val))
            .attr('id', 'outlier')
          }
        }      
      });
    }
    let colors: string[] = ["#ff7f0e", "#2ca02c", "#9467bd", "#e377c2", "#bcbd22"]
    let colorScaleD3 = d3.scaleOrdinal(colors)

    ////// DRAW AREA-SELECTION LINES

    Object.keys(this.areaLinesObjToDraw).forEach(k => {
      this.svg.append('path')
        .datum(this.areaLinesObjToDraw[k])
        .style("fill", "none")
        .attr("stroke", "black")
        .style("stroke-width", this.sizes["country-border"]/c.zoomScale)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'country-line-border')
        .attr('id', 'country-' + k + "-border")
        .attr('d', this.countryLine)
    })

    Object.keys(this.areaLinesObjToDraw).forEach(k => {
      this.svg.append('path')
        .datum(this.areaLinesObjToDraw[k])
        .style("fill", "none")
        .attr("stroke", "grey")
        .style("stroke-width", this.sizes["country-line"]/c.zoomScale)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'country-line')
        .attr('id', 'country-' + k)
        .attr('d', this.countryLine)
        .on("mouseover", _ => this.highlight(k, this, this.RATIOCHART_COMPONENT_TAG))
        .on("mouseleave", _ => this.doNotHighlight(k, this, this.RATIOCHART_COMPONENT_TAG))
        .append("svg:title")
        .text(k);

      for (let year in this.areaLinesObjToDraw[k]){
        if(this.areaLinesObjToDraw[k][year].time!=null){
          this.svg.append('circle')
            .datum(this.areaLinesObjToDraw[k])
            .attr("stroke", "black")
            .attr("fill", "grey")
            .attr("r", this.sizes["circle"]/c.zoomScale)
            .style("stroke-width", this.sizes["circle-width"]/c.zoomScale)
            .attr("cx", this.x(this.areaLinesObjToDraw[k][year].date))
            .attr("cy", this.y(this.areaLinesObjToDraw[k][year].time))
            .attr('class', 'country-circle')
            .attr('id', 'country-circle-' + k)
            .on("mouseover", _ => this.highlight(k, this, this.RATIOCHART_COMPONENT_TAG))
            .on("mouseleave", _ => this.doNotHighlight(k, this, this.RATIOCHART_COMPONENT_TAG))
            .append("svg:title")
            .text("Ratio: "+ this.areaLinesObjToDraw[k][year].time + "s" + ", " + k);

        }
      }
    })


    ////// DRAW COUNTRIES LINES

    Object.keys(this.lineObjToDraw).forEach(k => {
      this.svg.append('path')
        .datum(this.lineObjToDraw[k])
        .style("fill", "none")
        .attr("stroke", "black")
        .style("stroke-width", this.sizes["country-border"]/c.zoomScale)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'country-line-border')
        .attr('id', 'country-' + k + "-border")
        .attr('d', this.countryLine)
    })

    let index = 0
    let rectsize = 7

     Object.keys(this.lineObjToDraw).forEach(k => {
      this.svg.append('path')
        .datum(this.lineObjToDraw[k])
        .style("fill", "none")
        .attr("stroke", d =>{
          return (colorScaleD3(d))
        })
        .style("stroke-width", this.sizes["country-line"]/c.zoomScale)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'country-line')
        .attr('id', 'country-' + k)
        .attr('d', this.countryLine)
        .on("mouseover", _ => this.highlight(k, this, this.RATIOCHART_COMPONENT_TAG))
        .on("mouseleave", _ => this.doNotHighlight(k, this, this.RATIOCHART_COMPONENT_TAG))
        .append("svg:title")
        .text(k);

      for (let year in this.lineObjToDraw[k]){
        if(this.lineObjToDraw[k][year].time!=null){
          this.svg.append('circle')
            .datum(this.lineObjToDraw[k])
            .attr("stroke", "black")
            .attr("fill", d =>{
              return (colorScaleD3(d))
            })
            .attr("r", this.sizes["circle"]/c.zoomScale)
            .style("stroke-width", this.sizes["circle-width"]/c.zoomScale)
            .attr("cx", this.x(this.lineObjToDraw[k][year].date))
            .attr("cy", this.y(this.lineObjToDraw[k][year].time))
            .attr('class', 'country-circle')
            .attr('id', 'country-circle-' + k)
            .on("mouseover", _ => this.highlight(k, this, this.RATIOCHART_COMPONENT_TAG))
            .on("mouseleave", _ => this.doNotHighlight(k, this, this.RATIOCHART_COMPONENT_TAG))
            .append("svg:title")
            .text("Time: "+ this.lineObjToDraw[k][year].time + "s"+ ", " + k);
        }
      }
    })

    ////// ZOOM
    let g = this.svg
    let lineSelection = d3.selectAll(".country-line").nodes()
    let circleSelection = d3.selectAll(".country-circle").nodes()
    let borderSelection = d3.selectAll(".country-line-border").nodes()
    let zoom: any = d3.zoom()
      .extent([[0, 0], [this.width, this.height]])
      .translateExtent([[0, 0], [this.width, this.height]])
      .scaleExtent([1, 10])
      .on('zoom', function (event) {
        c.zoomScale = event.transform.k
        if(event.transform.k == 1){
          //g.call(zoom.transform, d3.zoomIdentity)
          g.attr('transform', 'translate(' + 60 + ', ' + 10 + ')          scale(' + event.transform.k + ')')
        }
        else{
          g.attr('transform', 'translate(' + event.transform.x + 60 + ', ' + event.transform.y + 10 + ')          scale(' + event.transform.k + ')')
        }
        lineSelection.forEach(path =>{
          d3.select(path).style("stroke-width", c.sizes["country-line"]/c.zoomScale)
        })
        circleSelection.forEach(circle =>{
          d3.select(circle).style("r", c.sizes["circle"]/c.zoomScale)
          d3.select(circle).style("stroke-width", c.sizes["circle-width"]/c.zoomScale)
        })
        borderSelection.forEach(path =>{
          d3.select(path).style("stroke-width", c.sizes["country-border"]/c.zoomScale)
        })
      });

    this.svg.call(zoom)
      .on("dblclick.zoom", null)
      .on("mousedown.zoom", null)
      .on("touchstart.zoom", null)
      .on("touchmove.zoom", null)
      .on("touchend.zoom", null);
  }

  onClick(area, c, source){
    if (source === this.RATIOCHART_COMPONENT_TAG){
      if(!this.selectedAreas.includes(area)){
        this.selectedAreas.push(area)
      }
      else {
        this.selectedAreas.splice(this.selectedAreas.indexOf(area),1)
      }
      this.dataService.AreaClickReady(this.selectedAreas)
    }
  }

  highlight(noc, c, source) {

    c.currentCountryNoc = noc
    c.currentSelected = noc

    if (source === this.RATIOCHART_COMPONENT_TAG) {
      this.dataService.updateMouseSelection({
        currentlySelected: true,
        noc: noc,
        source: this.RATIOCHART_COMPONENT_TAG
      })
    }
    d3.selectAll(".country-line")
      .style("opacity", 0.3)
    d3.selectAll(".country-circle")
    .style("opacity", 0.3)
    d3.selectAll("#country-circle-" + noc)
    .style("opacity", 1)
    d3.select("#country-" + noc)
      .style("stroke-width", (this.sizes["country-line"]+1)/this.zoomScale)
      .style("opacity", 1)
    d3.select("#country-" + noc + "-border")
    .style("stroke-width", (this.sizes["country-border"]+1)/this.zoomScale)
    .style("opacity", 1)
  }

  // Unhighlight
  doNotHighlight(noc, c, source) {
    if (source === this.RATIOCHART_COMPONENT_TAG) {
      this.dataService.updateMouseSelection({
        currentlySelected: false,
        noc: noc,
        source: this.RATIOCHART_COMPONENT_TAG
      })
    }
    d3.selectAll(".country-line")
      .style("opacity", 1)
    d3.selectAll(".country-circle")
      .style("opacity", 1)
    d3.select("#country-"+ noc)
      .style("stroke-width", (this.sizes["country-line"])/this.zoomScale)
    d3.select("#country-"+ noc + "-border")
      .style("stroke-width", (this.sizes["country-border"])/this.zoomScale)
  }

  

  selectionToRange(c){
    let start = +d3.select("#brush").select(".selection").attr("x")
    let end = start + +d3.select("#brush").select(".selection").attr("width")
    let yearStart = Math.floor(c.x.invert(start))
    let yearEnd = Math.floor(c.x.invert(end))
    if (yearStart == yearEnd){
      yearStart = 2004
      yearEnd = 2020
    }
    c.dataService.changeYearRange([yearStart, yearEnd])
  }

  update() {
    if (this.initialized) {

      this.width = this.doc.getElementById("div_ratioChart").clientWidth;
      this.height = this.doc.getElementById("div_ratioChart").clientHeight;
      this.pushData();
      this.buildSvg();
      this.addXandYAxis();
      this.drawLineAndPath(this);
    }
  }

}
