import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { bronzes, ColorScale, golds, Medal, MouseSelection, PreCheckedSports, PreCheckedSports2, ScatterConf, silvers, Sport } from 'src/data/data';
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
export class MedalProgressionChartComponent implements OnInit {

  private MEDALPROGRESSION_COMPONENT_TAG = "MedalProgression"


  dimensions: any
  private subDataReadiness: Subscription
  private subYearRangeChanged: Subscription
  private subSelectedMedals: Subscription
  private subSelectedSports: Subscription
  private subDataUpdated: Subscription
  private traditionSelectionSubscription: Subscription
  private htmlElement: HTMLElement;

  private isDataReady: boolean
  private spacing: number = 0

  private initialized = false

  private yearRange: number[]

  private selectedMedals: string[]
  private selectedSports: string[]
  private selectedCountries: string[]

  private color: any

  private countries: any = {}

  private doc: any = {}

  private stats: any
  private maxSelectedSports: number
  //private height: number
  //private width: number

  private margin = { top: 30, right: 40, bottom: 30, left: 60 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;

  public title = 'Line Chart';
  data: any[] = [
    { date: 10, value: 40 },
    { date: 20, value: 93 },
    { date: 30, value: 95 },
    { date: 40, value: 130 },
    { date: 50, value: 110 },
    { date: 60, value: 120 },
    { date: 70, value: 129 },
    { date: 80, value: 107 },
    { date: 90, value: 140 },
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

    // this.subDataUpdated = dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
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
      message.currentlySelected ? this.highlight(message.noc, this, message.source) : this.doNotHighlight(message.noc, this, message.source)

    }
  }

  /*dataReady(message): any {
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
  }*/

  yearlyDataReady(message): any {
    let m = message
    let yearlyData = {}

    Object.keys(m).forEach(element => {
      let noc = m[element][0]
      let year = m[element][1]
      let sex = m[element][3]
      let medals = m[element][4]

      if (yearlyData[noc]) {
        if (yearlyData[noc][year]) {
          if (yearlyData[noc][year][sex]) {
            yearlyData[noc][year][sex] += medals
            yearlyData[noc][year].total += medals
          }
          else {
            yearlyData[noc][year][sex] = medals
            yearlyData[noc][year].total += medals

          }
        }
        else {
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
      if (q.medalsByGdp) {
        if (Object.keys(this.loaderService.avgGdpDict).includes(noc)) {
          Object.keys(yearlyData[noc]).forEach(year => {
            this.arrayFormData.push({
              "noc": noc,
              "date": Number(year),
              "medals": yearlyData[noc][year].total * 10000000000
            })
          });
        }
      }
      else if (q.medalsByPop) {
        if (Object.keys(this.loaderService.avgPopDict).includes(noc)) {
          Object.keys(yearlyData[noc]).forEach(year => {
            this.arrayFormData.push({
              "noc": noc,
              "date": Number(year),
              "medals": yearlyData[noc][year].total * 100000
            })
          });
        }

      }
      else {
        Object.keys(yearlyData[noc]).forEach(year => {
          this.arrayFormData.push({
            "noc": noc,
            "date": Number(year),
            "medals": yearlyData[noc][year].total
          })
        });

      }
    });
    this.update()
  }

  ngOnInit(): void {
    // this.width = document.getElementById("div_medalprogression").clientWidth;
    // this.height = document.getElementById("div_medalprogression").clientHeight;
    this.neverPlotted = true
    this.initialized = true
    this.doc = document
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
    this.width = ScatterConf.width
    this.height = ScatterConf.height

    if (this.neverPlotted) {
      this.neverPlotted = false

      /*if(!ScatterConf.isScatter) {
        this.width = this.width - this.margin.left - this.margin.right;
        this.height = this.height - this.margin.top - this.margin.bottom;
      } else {
      }*/

      this.svg = d3Sel.select("#div_medalprogression")
        .append("svg")
        .attr("id", "svg_medalprogression")
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 790 420')
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    }
  }
  private addXandYAxis() {
    let q = this.loaderService.query
    let ticks = 10
    if (q) {
      ticks = (q.end - q.start) / 4
    }
    // range of data configuring
    this.x = d3.scaleLinear()
      .range([0, this.width])
      .domain(d3Array.extent(this.arrayFormData, (d) => d.date));

    this.y = d3Scale.scaleLinear()
      .range([this.height, 0])
      .domain(d3Array.extent(this.arrayFormData, (d) => d.medals));

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
      .y((d: any) => this.y(d.medals));
    console.log("my line", this.line)
    // Configuring line path

    let objToDraw = {}
    this.arrayFormData.forEach(afd => {
      let noc = afd.noc
      let list = objToDraw[noc]
      if (!list) {
        list = []
        objToDraw[noc] = list
      }
      list.push(afd)
    })



    this.svg.selectAll(".progression-line").remove()
    Object.keys(objToDraw).forEach(k => {
      let color = ColorScale(this.countries[k] && this.countries[k].continent ? this.countries[k].continent : "")
      this.svg.append('path')
        .datum(objToDraw[k])
        .style("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr('class', 'line')
        .attr('class', 'progression-line')
        .attr('id', 'progression-' + k)
        .attr('d', this.line)
        .on("mouseover", _ => this.highlight(k, this, this.MEDALPROGRESSION_COMPONENT_TAG))
        .on("mouseleave", _ => this.doNotHighlight(k, this, this.MEDALPROGRESSION_COMPONENT_TAG))


    })

  }



  highlight(noc, c, source) {

    c.currentCountryNoc = noc
    noc && this.countries[noc] && (c.currentCountryName = this.countries[noc].name)

    c.currentSelected = noc
    c.currentCountryName = this.countries[c.currentSelected.name] && this.countries[c.currentSelected.name].name || ""
    c.currentCountryNoc = c.currentSelected.name

    if (source === this.MEDALPROGRESSION_COMPONENT_TAG) {
      this.dataService.updateMouseSelection({
        currentlySelected: true,
        noc: noc,
        source: this.MEDALPROGRESSION_COMPONENT_TAG
      })
    }

    d3.selectAll(".progression-line")
      .transition().duration(200)
      .style("opacity", "0.07")
    // Second the hovered specie takes its color
    d3.select("#line-" + noc)
      .transition().duration(200)
      .style("opacity", "1")
    d3.select("#progression-" + noc)
      .transition().duration(200)
      .style("opacity", "0.5")
    d3.select("#line-" + "BORDER")
      .transition().duration(200)
      .style("opacity", "0.5")
  }

  // Unhighlight
  doNotHighlight(noc, c, source) {
    if (source === this.MEDALPROGRESSION_COMPONENT_TAG) {
      this.dataService.updateMouseSelection({
        currentlySelected: false,
        noc: noc,
        source: this.MEDALPROGRESSION_COMPONENT_TAG
      })
    }
    d3.selectAll(".progression-line")
      .transition().duration(200).delay(200)
      .style("opacity", 1)
    if (this.selectedTraditionNoc) {
      d3.select("#line-" + this.selectedTraditionNoc)
        .transition().duration(200)
        .style("opacity", "1")
      d3.select("#line-" + "BORDER")
        .transition().duration(200)
        .style("opacity", "1")
    }
  }

  update() {
    if(this.initialized) {
      this.width = this.doc.getElementById("div_medalprogression").clientWidth;
      this.height = this.doc.getElementById("div_medalprogression").clientHeight;
      
      this.buildSvg();
      this.addXandYAxis();
      this.drawLineAndPath();
  
    }
  }

}