import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataService } from "../data.service";
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import { LoaderService } from '../loader.service';
import { bronzes, golds, MouseSelection, PreCheckedSports2, silvers, Team, Teams, AllNocs } from 'src/data/data';
@Component({
  selector: 'app-medal-chart',
  templateUrl: './medal-chart.component.html',
  styleUrls: ['./medal-chart.component.css']
})

export class MedalChartComponent implements OnInit, OnDestroy {

  width: number;
  height: number;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  x: any
  y: any
  xAxis: any
  yAxis: any
  svg: any
  g: any
  // golds: GoldEntry[] = []
  // goldsFiltered: GoldEntry[] = []
  stats: any
  statsFiltered: any = []
  selectedMedals: string[] = []
  selectedCountries: string[] = []
  max: number

  selectedTraditionNoc: string
  selectedTraditionStatus: boolean
  

  countries: any = {}
  color: any = {}

  firstRun = true
  currentSelected: any = {}
  currentCountryNoc: string

  @Input()
  teamsList: Team[] = Teams;
  subscription: Subscription;
  subDataUpdated: Subscription;

  constructor(private data: DataService, private dataService: DataService, private loaderService: LoaderService) {
    this.width = 750 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
    // this.subscription = this.data.currentMessage.subscribe(message => this.onMessageReceived(message))
    this.subDataUpdated = data.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))

    this.dataService.traditionSelectionMessage.subscribe(message => {
      this.selectedTraditionNoc = message.currentlySelected ? message.noc : undefined
    })

  }

  onMouseSelection(message: MouseSelection) {
    console.log("medalchart mouse selection event: ", message)
    if(message.source && message.source !== MedalChartComponent.name) {
      message.currentlySelected ? this.highlight(null, message.noc, this) : this.doNotHighlight(null, message.noc, this)

    }
  }

  dataReady(message: any) {
    if (message && message.length == 7) {
      console.log("medal-chart invoked data ready: ", this.subDataUpdated)
      this.stats = message[0]
      this.max = message[1]
      this.selectedMedals = message[4]
      this.selectedCountries = message[6]
      this.selectedCountries.length === 0 && (this.selectedCountries = AllNocs) //["USA", "FRA", "GER"])
      this.countries = this.loaderService.countries
      // this.firstPlot && this.plot()
      this.filterData()
      this.firstRun && this.initChart()
      this.updateChart()
    }
  }

  /*onMessageReceived(message) {
    this.teamsList = message
    if (this.golds.length > 0) {
      this.filterData()
      this.updateChart()
    }
  }*/

  ngOnInit(): void {
    // this.plotGraph()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initSvg() {
    this.svg = d3Sel.select('#barChartMedals')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      //.attr('viewBox', '0 0 900 500');
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  plotGraph() {
    // this.initData()
    /*d3Sel.selectAll("rect")
      .on("mouseover",
        function () {
          console.log("got hover")
          d3Sel.select(this)
            .attr("fill", "#f98bfc")
        }
      );*/
  }

  onDataInitialized() {
    // console.log(this.golds)
    this.filterData()
    this.initChart()
    this.updateChart()
  }

  filterData() {
    // this.goldsFiltered = this.golds.filter(t => this.teamsList.some(t2 => t.team == t2.name && t2.isChecked));
    this.statsFiltered = this.selectedCountries.map(c => this.stats[c])
    this.statsFiltered = this.sort_object_of_objects(this.statsFiltered, "total")
    this.statsFiltered = this.statsFiltered.slice(0, 25)
    console.log("medal chart stats filtered:")
    console.log(this.statsFiltered)
  }

  sort_object_of_objects(data, attr) {
    let arr = [];
    for (let prop in data) {
        if (data.hasOwnProperty(prop)) {
            let obj = {
              tempSortName: 0
            };
            if (data[prop]){
              obj[prop] = data[prop];
              obj.tempSortName = Number(data[prop][attr]);
              arr.push(obj)
            }
        }
    }

    arr.sort(function(a, b) {
        let at = a.tempSortName,
            bt = b.tempSortName;
        return at > bt ? -1 : ( at < bt ? 1 : 0 );
    });

    var result = [];
    for (let i=0, l=arr.length; i<l; i++) {
        var obj = arr[i];
        delete obj.tempSortName;
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                var id = prop;
            }
        }
        let item = obj[id];
        result.push(item);
    }
    return result;
}

  initChart() {
    this.firstRun = false
    //this.initSvg()

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 70, left: 60 }

    this.color = d3.scaleOrdinal()
        .domain(["Asia", "Africa", "North America", "South America", "Europe", "Oceania"])
        .range(["#0085c7", "#ff4f00", "#f4c300", "#f4c300", "#7851A9", "#009f3d"])

    // append the svg object to the body of the page
    this.svg = d3Sel.select("#barChartMedals")
      .append("svg")
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 790 420')
      .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    // Initialize the X axis
    this.x = d3.scaleBand()
      .range([0, this.width])
      .padding(0.2);
    this.xAxis = this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")

    // Initialize the Y axis
    this.y = d3.scaleLinear()
      .range([this.height, 0]);
    this.yAxis = this.svg.append("g")
      .attr("class", "myYaxis")
  }

  highlight(ev, d, c) {
    if (typeof d === 'string'){
      //TODO if Noc received is in the bars
      c.currentCountryNoc = d
    } else {
      console.log("trying to highlight")
      c.currentSelected = d
      c.currentCountryNoc = c.currentSelected.name
      this.dataService.updateMouseSelection({
        currentlySelected: true,
        noc: c.currentCountryNoc,
        source: MedalChartComponent.name
      })
    }

    d3.selectAll(".medalBar")
      .transition().duration(200)
      .style("opacity", "0.2")
    // Second the hovered specie takes its color
    d3.select("#bar-" + c.currentCountryNoc)
      .transition().duration(200)
      .style("opacity", "1")

    


  }

  doNotHighlight(ev, d, c){
    if (typeof d !== 'string'){
      this.dataService.updateMouseSelection({
        currentlySelected: false,
        noc: c.currentCountryNoc,
        source: MedalChartComponent.name
      })
    }
    c.currentSelected = {}
    c.currentCountryName = ""
    d3.selectAll(".medalBar")
      .transition().duration(200).delay(200)
      .style("opacity", 1)
  }


  updateChart() {
    // Update the X axis
    // this.x.domain(this.goldsFiltered.map(function(d) { return d.team }))
    this.x.domain(this.statsFiltered.map(function (d) {
      if (d) {
        return d.name
      }
      return ""
    }))

    var axisLabelX = -40;
    var axisLabelY = 200;
    let labelText = 'Total Medals' //da cambiare a seconda dei filtri
    this.svg.select("#medalChartLabel").remove()
    this.svg.append("g")
      .attr('id', "medalChartLabel")
      .attr('transform', 'translate(' + axisLabelX + ', ' + axisLabelY + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text(labelText)
      .style("fill", "white");

    //this.x.domain(this.goldsFiltered.map((d) => d.team));
    this.xAxis.call(d3.axisBottom(this.x))

    // Update the Y axis
    // this.y.domain([0, d3Array.max(this.goldsFiltered, (d) => d.golds)]);

    /////// Now we do sorting, could just return first value
    let max = 0
    this.statsFiltered.forEach(element => {
      if(element) {
        let sum = 0
        // this.selectedMedals.includes(golds) && (sum += element.golds)
        // this.selectedMedals.includes(silvers) && (sum += element.silvers)
        // this.selectedMedals.includes(bronzes) && (sum += element.bronzes)
        sum += element.total
        sum > max && (max = sum)  
      }
    })
    ////////
    this.y.domain([0, max]);

    this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y));

    // this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    // this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    // this.x.domain(this.goldsFiltered.map((d) => d.team));
    // this.y.domain([0, d3Array.max(this.goldsFiltered, (d) => d.golds)]);

    //this.xAxis.call(d3.axisBottom(this.x))

    // Update the Y axis
    // this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y));

    // Create the u variable
    //var u = this.svg.select("#barChartMedals").selectAll(".bar").data(this.goldsFiltered)
    // var u = this.svg.select("#barChartMedals").data(this.goldsFiltered)

   //!this.selectedTraditionStatus && d3.select("#bar-" + this.currentCountryNoc)
   //  .style("outline-width", "0px")
    this.svg.selectAll(".medalBar").remove()
    var u = this.svg.selectAll(".medalBar").data(this.statsFiltered)

    u
      .enter()
      .append('rect')
      //.attr('class', 'bar') // Add a new rect for each new elements
      .attr('class', 'medalBar') // Add a new rect for each new elements
      // .attr('id', d => 'bar-'+ d.name)
      .merge(u) // get the already existing elements as well
      .on("mouseover", (event, d) => this.highlight(event, d, this))
      .on("mouseleave", (event, d) => this.doNotHighlight(event, d, this))
      .attr('x', (d) => this.x(d && d.name))
      .attr('y', (d) => this.y(d && (d.golds + d.bronzes + d.silvers)))
      .attr('width', this.x.bandwidth())
      .attr('height', (d) => this.height - this.y(d && (d.golds + d.bronzes + d.silvers)))
      .attr("fill", d => this.color(this.countries[d.name] && this.countries[d.name].continent))
      .style("outline-color", "initial")
      .style("outline-style", "solid")
      .style("outline-width", (d) => this.selectedTraditionNoc === d.name ? "3px": "0px")

      .attr('id', d => 'bar-'+ d.name)
      // .style("outline", (d) => this.currentCountryNoc === d.name ? "3px solid !important;": "10px solid !important;")
      .transition() // and apply changes to all of them
      .duration(1000)

    // If less group in the new dataset, I delete the ones not in use anymore
    u
      .exit()
      .remove()
  }


  /*  initData() {
      let golds = this.golds
      d3.csv("/assets/data/athlete_events.csv").then(function (data) {
        let dict: any = {}
        for (let i = 0; i < data.length; i++) {
          let team = data[i].Team || ""
          if (!dict[team]) {
            dict[team] = 0
          }
          if (data[i].Medal === "Gold") {
            dict[team]++
          }
        }
  
        for (let key in dict) {
          let entry: GoldEntry = {
            team: key,
            golds: dict[key]
          }
          golds.push(entry);
        }
      }.bind(this)).then(this.onDataInitialized.bind(this))
    }
  */
}

/*
export interface GoldEntry {
  team: string;
  golds: number;
}

*/