import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as tjson from 'topojson';
import * as d3geo from 'd3-geo'
import * as d3tip from 'd3-tip'
import { color, max, select } from 'd3';
import { LoaderService } from '../loader.service';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs';
import { bronzes, golds, Medal, MouseSelection, PreCheckedSports, silvers, Sport, Stat } from 'src/data/data';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

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

  private MAP_COMPONENT_TAG = "MapComponent"

  private isDataReady: Boolean = false
  private selectedSports: string[] = PreCheckedSports
  private yearsRange: number[]
  selectedMedals: string[]
  selectedStats: Stat
  selectedColor: string
  stats: {}

  countries: any

  highlightToggle: boolean = true
  lastSelected: string

  actionsEnabled: boolean = false

  constructor(private loaderService: LoaderService, private dataService: DataService) {
    dataService.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))
    dataService.pcaDataReadyMessage.subscribe(message => message && (this.actionsEnabled = true))
    dataService.updateReadinessMessage.subscribe(message => message && message.length > 0 && (this.actionsEnabled = false))

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
      // this.firstPlot && this.plot()
      this.updateMap()
    }

  }

  /*
  dataReady(isReady: Boolean): any {
    if(isReady) {
      this.isDataReady = true
      this.onYearRangeChanged(this.yearsRange)
      //this.updateMap()
    }
  }*/

  onSelectedMedalsChanged(message: Medal[]) {
    this.selectedMedals = []
    message.forEach(m => {
      m.isChecked && this.selectedMedals.push(m.id)
    })
    this.updateMap()
  }

  onSelectedSportsChanged(message: Sport[]) {
    this.selectedSports = message.map(s => s.name)
    this.updateMap()
  }

  updateMap() {
    console.log("update map invoked")
    if (this.isDataReady) {
      // let [stats, max] = this.loaderService.computeMedalsByNationInRange(this.yearsRange[0], this.yearsRange[1], this.selectedMedals, this.selectedSports)
      // this.stats = stats
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

  /*
  updateMap(): void {
    var maxmedals = 5600
    let NOCs = this.loaderService.olympicsDict.NOC
    this.g.selectAll("path").attr("fill", function(d, event) {
      let currentNOC = d.properties.NOC
      let team = NOCs[currentNOC]
      if (team) {
        var medalsum=team.golds+team.silver+team.bronze
        var intensity = medalsum*100/maxmedals
        if (currentNOC === "MAD") {
          console.log (medalsum)
          console.log (intensity)
        }
        if (intensity==0) {
          return ("#000000")
        }
        if (intensity>0 && intensity<7.7) {
          return ("#488f31")
        }
        else if (intensity>=7.7 && intensity<15.4) {
          return ("#639c4e")
        }
        else if (intensity>=15.4 && intensity<23.1) {
          return ("#7ca869")
        }
        else if (intensity>=23.1 && intensity<30.8) {
          return ("#94b585")
        }
        else if (intensity>=30.8 && intensity<38.8) {
          return ("#abc1a1")
        }
        else if (intensity>=38.8 && intensity<46.2) {
          return ("#c3cebd")
        }
        else if (intensity>=46.2 && intensity<53.9) {
          return ("#dadada")
        }
        else if (intensity>=53.9 && intensity<61.6) {
          return ("#dec2c1")
        }
        else if (intensity>=61.6 && intensity<69.3) {
          return ("#e0aaaa")
        }
        else if (intensity>=69.3 && intensity<77) {
          return ("#e09192")
        }
        else if (intensity>=77 && intensity<84.7) {
          return ("#de787c")
        }
        else if (intensity>=84.7 && intensity<92.4) {
          return ("#da5d66")
        }              
        else return ("#de425b")
      }
      else return "#000000"
    })
  }
*/

  centerMap() {
    console.log("centering map...")
    this.width = document.getElementById("svg_map").clientWidth || 800

    let g = this.g

    let zoom = d3.zoom()
      .scaleExtent([1, 20])
      .on('zoom', (event) => {
        g.selectAll('path')
          .attr('transform', event.transform);
        g.selectAll("circle")
          .attr('transform', event.transform);
        g.selectAll("text")
          .attr('transform', event.transform);
      })

      this.svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity.scale(1).translate(0,0));

  }

  initMap(): void {
    console.log("initMap method")

    /*d3.geoMercator()
      .center([-30, -20])
      .scale(80)
      .rotate([-180, 0]);
*/
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

    this.svg.call(zoom);

    // console.log(this.loaderService.olympicsDict)
    /*this.g.selectAll("path")
      .on("mouseover", function() {
        console.log("got hover")
        //d3.select(item).attr("fill", "#f98bfc")
      })*/
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
  
    if(this.actionsEnabled) {
      if (!this.stats[d.properties.NOC] || this.stats[d.properties.NOC].noPop || this.stats[d.properties.NOC].noGdp) {
        return
      }
      console.log("onClick called")
      let selectedCountry = d.properties.NOC 
      console.log(selectedCountry)
      if(selectedCountry!==this.lastSelected){
        this.highlightToggle = true
        this.lastSelected = selectedCountry
        this.doNotHighlight(e, d, context)
        this.highlight(e,d,context)
        this.highlightToggle = false
        context.dataService.updateTraditionSelection({
          noc: selectedCountry,
          currentlySelected: true,
          source: this.MAP_COMPONENT_TAG
        })
        this.componentHeight = this.COMPONENT_HEIGHT_TRAD
      }else{
        this.highlightToggle = true
        this.doNotHighlight(e, d, context)
        this.lastSelected = undefined
        context.dataService.updateTraditionSelection({
          noc: selectedCountry,
          currentlySelected: false,
          source: this.MAP_COMPONENT_TAG
        })
        this.componentHeight = this.COMPONENT_HEIGHT
      }
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
  }

}
