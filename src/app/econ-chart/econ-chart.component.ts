import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { BothYears, bronzes, ColorScale, golds, Medal, MouseSelection, PreCheckedSports, PreCheckedSports2, ScatterConf, silvers, Sport, SummerYears, WinterYears } from 'src/data/data';
import { PerformanceConf } from 'src/data/data';
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
  selector: 'app-econ-chart',
  templateUrl: './econ-chart.component.html',
  styleUrls: ['./econ-chart.component.css']
})
export class EconChartComponent implements OnInit {

  private ECONFCHART_COMPONENT_TAG = "EconomicChart"


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

  public title = 'Economic Chart';


  private neverPlotted = true
  private economicDict: any
  private boxPlotDict: any
  private economicBoxPlotDict: any
  private economicBoxPlotOutliers: any
  private q: any

  private selectedAreas = []

  private sizes = {
    "circle": 2,
    "circle-width": 1,
    "country-line": 3,
    "country-border": 4,
    "medal-line": 2,
    "circle-outlier": 1
  }

  private zoomScale: number = 1

  arrayFormData = []
  areaObjToDraw = {}
  lineObjToDraw = {}
  areaLinesObjToDraw = {}


  constructor(private analyticsLoaderService: AnalyticsLoaderService, private dataService: DataService) {

    // this.subDataUpdated = dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.analyticsReadinessMessage.subscribe(message => this.analyticsDataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))

  } 

  onMouseSelection(message: MouseSelection) {
    if (message.source && message.source !== this.ECONFCHART_COMPONENT_TAG) {
      message.currentlySelected ? this.highlight(message.noc, this, message.source) : this.doNotHighlight(message.noc, this, message.source)
    }
  }

  analyticsDataReady(message: any){
    if (message == "updated"){
      this.economicDict = this.analyticsLoaderService.economicDict
      this.boxPlotDict = this.analyticsLoaderService.boxPlotDict
      this.economicBoxPlotDict = this.analyticsLoaderService.economicBoxPlotDict
      this.economicBoxPlotOutliers = this.analyticsLoaderService.economicBoxPlotOutliers
      this.q = this.analyticsLoaderService.q
      this.arrayFormData = []
      this.areaObjToDraw = {}
      this.lineObjToDraw = {}
      this.areaLinesObjToDraw = {}
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
    let labelText = ''
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


    Object.keys(this.economicDict).forEach(year => {

      if(!this.q || this.q.yearStart<= Number(year) && Number(year)<=this.q.yearEnd){
    
        for( let country of selectedCountries){
          if (this.economicDict[year][country]){
            this.lineObjToDraw[country].push({
              "date": Number(year),
              "pounds": Number(this.economicDict[year][country])
            })
          }else{
            this.lineObjToDraw[country].push({
              "date": Number(year),
              "pounds": null
            })
          }
        }
        for( let country of selectedAreaCountries){
          if (this.economicDict[year][country]){
            this.areaLinesObjToDraw[country].push({
              "date": Number(year),
              "pounds": Number(this.economicDict[year][country])
            })
          }else{
            this.areaLinesObjToDraw[country].push({
              "date": Number(year),
              "pounds": null
            })
          }
        }
      }
    })

    Object.keys(this.economicBoxPlotDict).forEach(year => {

      let top 
      let topPercentile 
      let median 
      let bottomPercentile 
      let bottom 

      if (this.economicBoxPlotDict[year].length == 1){
        top = this.economicBoxPlotDict[year]
        topPercentile = this.economicBoxPlotDict[year]
        median = this.economicBoxPlotDict[year]
        bottomPercentile = this.economicBoxPlotDict[year]
        bottom = this.economicBoxPlotDict[year]
      }
      else{
        top = this.economicBoxPlotDict[year][0]
        topPercentile = this.economicBoxPlotDict[year][1]
        median = this.economicBoxPlotDict[year][2]
        bottomPercentile = this.economicBoxPlotDict[year][3]
        bottom = this.economicBoxPlotDict[year][4]        
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
    this.width = PerformanceConf.width
    this.height = PerformanceConf.height

    if (this.neverPlotted) {
      this.neverPlotted = false

      this.svg = d3Sel.select("#div_econ-chart")
        .append("svg")
        .attr("id", "svg_econChart")
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
    if (this.q.showOutliers == true){
      let outliersDomainMax = 0
      Object.keys(this.economicBoxPlotOutliers).forEach(year => {
        if (this.economicBoxPlotOutliers[year].length>0){
          if (this.economicBoxPlotOutliers[year][0]>outliersDomainMax){
            outliersDomainMax = this.economicBoxPlotOutliers[year][0]
          }
        }
      })
      if (domain[1]<outliersDomainMax){
        domain[1]=outliersDomainMax
      }
    }

    let yearsDomain: number[] = []

    Object.keys(this.boxPlotDict).forEach(year =>{
      yearsDomain.push(Number(year))
    })

    let xDomain = [Math.min.apply(Math, yearsDomain),Math.max.apply(Math, yearsDomain)]
    
    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain(xDomain);
      //.domain(d3Array.extent(this.arrayFormData, (d) => d.date));

    this.y = d3.scaleLinear()
      .range([this.height, 0])
      .domain(domain);

    let XaxisLabelX = this.width / 2;
    let XaxisLabelY = this.height + 35
    let YaxisLabelX = -40;
    let YaxisLabelY = this.height / 2
    let labelText = this.getLabel()

    this.svg.select("#EconChartLabelX").remove()
    // this.svg.append("g")
    //   .attr('id', "EconChartLabelX")
    //   .attr('transform', 'translate(' + XaxisLabelX + ', ' + XaxisLabelY + ')')
    //   .append('text')
    //   .attr('text-anchor', 'middle')
    //   .text("Year")
    //   .style("fill", "white");

    this.svg.select("#EconChartLabelY").remove()
    this.svg.append("g")
      .attr('id', "EconChartLabelY")
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
      //.attr('transform', 'translate(0,' + this.height + ')')
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

    this.countryLine = d3.line()
      //.defined((d: any)=> d.pounds != null)
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.pounds))

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

    let areaColors = ["#7aa6c2", "#5886a5", "#346888","#004c6d"]
    let counter = 0

    ///// BRUSHING

    // let brush = d3.brushX()      
    // .extent( [ [0,0], [this.width,this.height] ] )
    // .on("end", _ => this.selectionToRange(this))   

    // this.svg.append("g")
    //   .attr("class", "brush")
    //   .attr('id', "brush")
    //   .call(brush)

    
    //// DRAW AREAS
    Object.keys(this.areaObjToDraw).forEach(k => {
      this.svg.append('path')
        .datum(this.areaObjToDraw[k])
        .attr("fill", _ =>{ 
          return areaColors[counter]
        })
        .attr('id', "area")
        .attr('d', this.area)
        .on('click',_ => this.onClick(k, this, this.ECONFCHART_COMPONENT_TAG))
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
            return "red"
          }
          return "none"
        })
        .style("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'progression-line')
        .attr('id', 'progression-' + k)
        .attr('d', this.line)
    })

    //// DRAW OUTLIERS
    if (this.q.showOutliers == true){
      Object.keys(this.economicBoxPlotOutliers).forEach(year => {
        if (this.economicBoxPlotOutliers[year].length != 0){
          for (let val of this.economicBoxPlotOutliers[year]){
            this.svg.append("circle")
            .datum(this.economicBoxPlotOutliers[year])
            .attr("stroke", "lightblue")
            .attr("fill", "lightblue")  
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
        .on("mouseover", _ => this.highlight(k, this, this.ECONFCHART_COMPONENT_TAG))
        .on("mouseleave", _ => this.doNotHighlight(k, this, this.ECONFCHART_COMPONENT_TAG))
        .append("svg:title")
        .text(k);

      for (let year in this.areaLinesObjToDraw[k]){
        if(this.areaLinesObjToDraw[k][year].pounds!=null){
          this.svg.append('circle')
            .datum(this.areaLinesObjToDraw[k])
            .attr("stroke", "black")
            .attr("fill", "grey")
            .attr("r", this.sizes["circle"]/c.zoomScale)
            .style("stroke-width", this.sizes["circle-width"]/c.zoomScale)
            .attr("cx", this.x(this.areaLinesObjToDraw[k][year].date))
            .attr("cy", this.y(this.areaLinesObjToDraw[k][year].pounds))
            .attr('class', 'country-circle')
            .attr('id', 'country-circle-' + k)
            .on("mouseover", _ => this.highlight(k, this, this.ECONFCHART_COMPONENT_TAG))
            .on("mouseleave", _ => this.doNotHighlight(k, this, this.ECONFCHART_COMPONENT_TAG))
            .append("svg:title")
            .text("Pounds: "+ this.areaLinesObjToDraw[k][year].pounds + "s" + ", " + k);

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
        .on("mouseover", _ => this.highlight(k, this, this.ECONFCHART_COMPONENT_TAG))
        .on("mouseleave", _ => this.doNotHighlight(k, this, this.ECONFCHART_COMPONENT_TAG))
        .append("svg:title")
        .text(k);

      for (let year in this.lineObjToDraw[k]){
        if(this.lineObjToDraw[k][year].pounds!=null){
          this.svg.append('circle')
            .datum(this.lineObjToDraw[k])
            .attr("stroke", "black")
            .attr("fill", d =>{
              return (colorScaleD3(d))
            })
            .attr("r", this.sizes["circle"]/c.zoomScale)
            .style("stroke-width", this.sizes["circle-width"]/c.zoomScale)
            .attr("cx", this.x(this.lineObjToDraw[k][year].date))
            .attr("cy", this.y(this.lineObjToDraw[k][year].pounds))
            .attr('class', 'country-circle')
            .attr('id', 'country-circle-' + k)
            .on("mouseover", _ => this.highlight(k, this, this.ECONFCHART_COMPONENT_TAG))
            .on("mouseleave", _ => this.doNotHighlight(k, this, this.ECONFCHART_COMPONENT_TAG))
            .append("svg:title")
            .text("Pounds: "+ this.lineObjToDraw[k][year].pounds + "s"+ ", " + k);

        }
      }
      
      /// DRAW LEGEND
      // this.svg.append("rect")
      //   .datum(this.lineObjToDraw[k])
      //   .attr("x", 1050)
      //   .attr("y", index*(rectsize+7))
      //   .attr("width", rectsize)
      //   .attr("height", rectsize)
      //   .style("fill", function(d){ return colorScaleD3(d)})
      //   .on("mouseover", _ => this.highlight(k, this, this.ECONFCHART_COMPONENT_TAG))
      //   .on("mouseleave", _ => this.doNotHighlight(k, this, this.ECONFCHART_COMPONENT_TAG))
      
      // this.svg.append("text")
      //   .datum(this.lineObjToDraw[k])
      //   .attr("x", 1050 + rectsize*1.5)
      //   .attr("y", function(d,i){ return index*(rectsize+7) + (rectsize/2)})
      //   .style("fill", function(d){ return colorScaleD3(d)})
      //   .text(function(d){ return k})
      //   .style("font-size", "smaller")
      //   .attr("text-anchor", "left")
      //   .style("alignment-baseline", "middle")
      //   .on("mouseover", _ => this.highlight(k, this, this.ECONFCHART_COMPONENT_TAG))
      //   .on("mouseleave", _ => this.doNotHighlight(k, this, this.ECONFCHART_COMPONENT_TAG))
      
      // index += 1
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
    if (source === this.ECONFCHART_COMPONENT_TAG){
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

    if (source === this.ECONFCHART_COMPONENT_TAG) {
      this.dataService.updateMouseSelection({
        currentlySelected: true,
        noc: noc,
        source: this.ECONFCHART_COMPONENT_TAG
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
    if (source === this.ECONFCHART_COMPONENT_TAG) {
      this.dataService.updateMouseSelection({
        currentlySelected: false,
        noc: noc,
        source: this.ECONFCHART_COMPONENT_TAG
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

    console.log("test", d3.select("#brush"))
    let start = +d3.select("#brush").select(".selection").attr("x")
    let end = start + +d3.select("#brush").select(".selection").attr("width")
    let yearStart = Math.floor(c.x.invert(start))
    let yearEnd = Math.floor(c.x.invert(end))
    if (yearStart == yearEnd){
      yearStart = 1896
      yearEnd = 2021
    }
    c.dataService.changeYearRange([yearStart, yearEnd])
  }

  update() {
    if (this.initialized) {

      this.width = this.doc.getElementById("div_econ-chart").clientWidth;
      this.height = this.doc.getElementById("div_econ-chart").clientHeight;
      this.pushData();
      this.buildSvg();
      this.addXandYAxis();
      this.drawLineAndPath(this);
    }
  }

}
