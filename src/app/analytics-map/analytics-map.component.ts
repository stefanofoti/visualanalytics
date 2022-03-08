import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as tjson from 'topojson';
import * as d3geo from 'd3-geo'
import * as d3tip from 'd3-tip'
import { color, max, select } from 'd3';
import { LoaderService } from '../loader.service';
import { AnalyticsConfComponent } from '../analytics-conf/analytics-conf.component';
import { AnalyticsLoaderService } from '../analytics-loader.service';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs';
import { bronzes, golds, Medal, MouseSelection, PreCheckedSports, silvers, Sport, Stat } from 'src/data/data';

@Component({
  selector: 'app-analytics-map',
  templateUrl: './analytics-map.component.html',
  styleUrls: ['./analytics-map.component.css']
})
export class AnalyticsMapComponent implements OnInit {

  COMPONENT_HEIGHT = "26vh"
  COMPONENT_HEIGHT_TRAD = "20vh"

  componentHeight = this.COMPONENT_HEIGHT


  private width
  private height
  private svg: any
  private g: any
  private path: any
  private div: any
  private max: number

  private dblClickFlag: boolean = false

  private MAP_COMPONENT_TAG = "MapComponent"

  private isDataReady: Boolean = false
  private selectedSports: string[] = PreCheckedSports
  private yearsRange: number[]
  private selectedCountries = []
  private mostSimilarSelected: string
  selectedMedals: string[]
  selectedStats: Stat
  selectedColor: string
  stats: {}

  countries: any
  countryList: any

  highlightToggle: boolean = true
  lastSelected: string

  actionsEnabled: boolean = false

  constructor(private loaderService: LoaderService, private dataService: DataService, private analyticsLoaderService: AnalyticsLoaderService) {
    dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))
    dataService.pcaDataReadyMessage.subscribe(message => message && (this.actionsEnabled = true))
    dataService.updateReadinessMessage.subscribe(message => message && message.length > 0 && (this.actionsEnabled = false))
    dataService.countryReadinessMessage.subscribe(message => this.countryList = message)

  }

  ngOnInit(): void {
    this.initMap()
  }

  onMouseSelection(message: MouseSelection) {
    console.log("map mouse selection event: ", message)
    if (message.source && message.source !== this.MAP_COMPONENT_TAG) {
      message.currentlySelected ? this.highlight(null, message.noc, this) : this.doNotHighlight(null, message.noc, this)
    }
  }

  dataReady(message: any): void {
    if (message && message.length == 7) {
      this.stats = message[0]
      this.max = message[1]
      this.selectedMedals = message[4]
      this.yearsRange = message[5]
      this.isDataReady = true
      this.countries = this.loaderService.countries
      this.updateMap()
    }

  }



  onSelectedSportsChanged(message: Sport[]) {
    this.selectedSports = message.map(s => s.name)
    this.updateMap()
  }

  updateMap() {
    console.log("update map invoked")
    if (this.isDataReady) {
      let stats = this.stats
      let maximum = Number(this.max)
      console.log("maximum amount of medals: " + maximum)
      let intervals = [1, 5, 12, 18, 27, 34, 69]
      intervals = this.colorScaleCalculator()
      this.g.selectAll("path").attr("fill", function (d, event) {

        //let colorScale = ["#ffffff", "#3c8a3e", "#4a984b", "#59a758", "#67b765", "#76c673", "#84d681", "#93e68f", "#a2f69d"]
        let colorScale = ["#ffffff", "#eebdb6", "#dca49d", "#ca8c84", "#b8746c", "#a65d55", "#93453f", "#802e2a", "#6d1317"]
        let currentNOC = d.properties.NOC
        let team = stats[currentNOC]

        if (team) {
          var intensity = team.total * 100 / maximum
          //console.log(currentNOC + ", " + intensity)

          if (team.noPop || team.noGdp) {
            return ("#9b9b9b")
          }
          if (intensity == 0) {

            return (colorScale[0])
          }
          if (intensity > 0 && intensity < intervals[0]) {
            return (colorScale[1])
          }
          else if (intensity >= intervals[0] && intensity < intervals[1]) {
            return (colorScale[2])
          }
          else if (intensity >= intervals[1] && intensity < intervals[2]) {
            return (colorScale[3])
          }
          else if (intensity >= intervals[2] && intensity < intervals[3]) {
            return (colorScale[4])
          }
          else if (intensity >= intervals[3] && intensity < intervals[4]) {
            return (colorScale[5])
          }
          else if (intensity >= intervals[4] && intensity < intervals[5]) {
            return (colorScale[6])
          }
          else if (intensity >= intervals[5] && intensity < intervals[6]) {
            return (colorScale[7])
          }
          else {
            return (colorScale[8])
          }
        }
        else return "#46424d"
      })
    }

  }

  colorScaleCalculator() {
    // let [stats, max] = this.loaderServicey.computeMedalsByNationInRange(this.yearsRange[0], this.yearsRange[1], this.selectedMedals, this.selectedSports)
    // this.stats = stats
    let maximum = Number(this.max)
    console.log("maximum amount of medals: " + maximum)
    var intensityDict = {}
    var nonZeroNations = 0
    var nationsInInterval = 0

    let intervals = [1, 5, 12, 18, 27, 34, 69, 100]

    for (const NOC in this.stats) {
      let currentNOC = NOC
      let team = this.stats[currentNOC]
      if (team) {
        var intensity = team.total * 100 / maximum
        if (intensity != 0) {
          if (!intensityDict.hasOwnProperty(intensity.toFixed(5))) {
            intensityDict[intensity.toFixed(5)] = 1
          }
          else {
            intensityDict[intensity.toFixed(5)]++
          }
          nonZeroNations++
        }
      }
    }

    nationsInInterval = Math.ceil(nonZeroNations / 8)
    intervals = []

    let keysarray = []
    for (const k in intensityDict) {
      keysarray.push(Number(k).toFixed(5))
    }
    keysarray = keysarray.sort(function (a, b) { return a - b; })
    console.log(keysarray)

    let weightsArray = []
    for (let i = 0; i < keysarray.length; i++) {
      weightsArray.push(keysarray[i + 1] - keysarray[i])
      if (i === 0) {
        intensityDict[keysarray[i]] = intensityDict[keysarray[i]] * weightsArray[i]

      }
      else {
        intensityDict[keysarray[i]] += intensityDict[keysarray[i - 1]] * weightsArray[i]
      }
    }
    console.log(weightsArray)
    console.log(intensityDict)

    let variableInterval = nationsInInterval

    for (let i = 0; i <= keysarray.length; i++) {
      if (variableInterval / weightsArray[i] <= intensityDict[keysarray[i]]) {
        intervals.push(keysarray[i])
        variableInterval += nationsInInterval
      }
    }

    console.log("intervals array: ", intervals)
    console.log("nations with intensity > 0: ", nonZeroNations)
    console.log("intervals of", nationsInInterval, "nations for each color")

    return (intervals)
  }

  onYearRangeChanged(newRange: number[]) {
    this.yearsRange = newRange
    this.updateMap()
  }

  initMap(): void {
    console.log("initMap method")

    this.svg = d3.select("#mainMap")
      .attr("id", "svg_map")
      .attr("width", "100%")
      //.attr("height", this.height);
      .attr("height", "100%");
    


    this.width = document.getElementById("svg_map").clientWidth || 800

    var projection = d3geo.geoNaturalEarth1()
      .scale(100)
      //.translate([this.width / 2, this.height / 2])
      .center([120,-50])
      //.center([this.width / 2, this.height / 2])



    this.div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


    this.path = d3.geoPath()
      .projection(projection);


    this.g = this.svg.append("g");
    console.log("original g:")
    console.log(this.g)

    d3.json("/assets/data/countries-110m-NOCs.json").then(topology => this.drawMap(topology));
    const g = this.g

    var zoom: any = d3.zoom()
      .scaleExtent([1, 10])
      .on('zoom', function (event) {
        g.selectAll('path')
          .attr('transform', event.transform);
        g.selectAll("circle")
          .attr('transform', event.transform);
        g.selectAll("text")
          .attr('transform', event.transform);
      });

    this.svg.call(zoom)
      .on("dblclick.zoom", null);
  }

  highlight(e, d, context) {
    //console.log(d)
    if (!d || !context.highlightToggle) {
      return
    }
    let noc
    if (typeof d === 'string') {
      context.selectedStats = {
        name_str: this.countries[d].name,
        golds: context.stats[d].golds || 0,
        silvers: context.stats[d].silvers || 0,
        bronzes: context.stats[d].bronzes || 0,
      }

      noc = d
    } else {
      context.selectedStats = context.stats[d.properties.NOC] || {
        id: "",
        name_str: d.properties.name,
        noc: d.properties.NOC,
        golds: 0,
        silvers: 0,
        bronzes: 0,
        from: 0,
        to: 0
      }
      this.dataService.updateMouseSelection({
        currentlySelected: true,
        noc: d.properties.NOC,
        source: this.MAP_COMPONENT_TAG
      })
      context.selectedStats.name_str = d.properties && d.properties.name || ""

      noc = d.properties.NOC
      // this.selectedColor = d3.select(e.currentTarget).attr("fill")
      // d3.select(e.currentTarget).attr("fill", "#0000ff")
    }


    d3.selectAll(".map-item")
    .style("opacity", "0.4")


    console.log("cerco noc: " + noc)
    let selection = d3.select("#map-" + noc)
    if(selection.size() > 0) {
      //this.selectedColor = selection.attr("fill")
      //selection.attr("fill", "#0000ff")
      //this.selectedColor = selection.attr("stroke-width")
      selection
        .style("stroke", "#000000")
        .style("stroke-width", "0.5px")
        .style("opacity", "1")
    }
  }

  doNotHighlight(e, d, context) {
    if (!d || !context.highlightToggle) {
      return
    }
    context.selectedStats = undefined
    let noc
    if (typeof d === 'string') {
      noc=d
    } else {
      //d3.select(e.currentTarget).attr("opacity", "100%")
      this.dataService.updateMouseSelection({
        currentlySelected: false,
        noc: d.properties.NOC,
        source: this.MAP_COMPONENT_TAG
      })
      noc = d.properties.NOC
    }
    //noc && (d3.select("#map-" + noc).attr("fill", this.selectedColor))
    noc && (d3.select("#map-" + noc)
    .style("stroke", "#000000")
    .style("stroke-width", "0.2px"))
    
    d3.selectAll(".map-item")
      .style("opacity", "1")
  }

  onClick(e, d, context){
    this.dblClickFlag = true
    setTimeout(()=>{
      if(this.dblClickFlag == true){
        this.mostSimilarSelected = undefined
        let selectedNoc = d.properties.NOC
        if(!this.selectedCountries.includes(selectedNoc)){
          this.selectedCountries.push(selectedNoc)
        }else{
          let indexOfNoc = this.selectedCountries.indexOf(selectedNoc)
          this.selectedCountries.splice(indexOfNoc, 1)
        }
        this.dataService.CountryFromMapReady(this.selectedCountries)
        this.doNotHighlight(e, d, context)
      }
   },250)
  }

  onDblClick(e, d, context){
    this.dblClickFlag = false
    this.selectedCountries = []

    if(this.mostSimilarSelected != d.properties.NOC){
      this.mostSimilarSelected = d.properties.NOC
      this.dataService.MostSimilarCountryReady(this.mostSimilarSelected)
    }
    else{
      this.mostSimilarSelected = undefined
      this.dataService.CountryFromMapReady(this.selectedCountries)
    } 

    let selectedCountry = d.properties.NOC 
      if(selectedCountry!==this.lastSelected){
        this.highlightToggle = true
        this.lastSelected = selectedCountry
        this.doNotHighlight(e, d, context)
        this.highlight(e,d,context)
        this.highlightToggle = false
      }else{
        this.highlightToggle = true
        this.doNotHighlight(e, d, context)
        this.lastSelected = undefined
      }
  }


  drawMap(topology): void {
    const div = this.div
    let context = this
    this.g.selectAll("path")
      .data(tjson.feature(topology, topology.objects.countries).features)
      .enter().append("path")
      .attr("d", this.path)
      .attr("id", d => "map-" + d.properties.NOC)
      .attr("class", d => "map-item")
      .style("stroke", "#000000")
      .style("stroke-width", "0.2px")
      //.style("stroke-dasharray", "2,2")
      .style("stroke-linejoin", "round")

      //.attr("fill", "#000000")
      .on("mouseover", (event, d) => this.highlight(event, d, context))
      .on("mouseout", (event, d) => this.doNotHighlight(event, d, context))
      .on("click", (event, d) => this.onClick(event, d, context))
      .on("dblclick", (event, d) => this.onDblClick(event, d, context))
  }

}