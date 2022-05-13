import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataService } from "../data.service";
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import { AnalyticsLoaderService } from '../analytics-loader.service';
import { LoaderService } from '../loader.service';
import { bronzes, golds, MouseSelection, PreCheckedSports2, silvers, Team, Teams, AllNocs, ColorScale } from 'src/data/data';
import { number } from 'mathjs';

@Component({
  selector: 'app-predict-chart',
  templateUrl: './predict-chart.component.html',
  styleUrls: ['./predict-chart.component.css']
})
export class PredictChartComponent implements OnInit {

  private CHART_COMPONENT_TAG = "PredictChartComponent"

  width: number;
  height: number;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  x: any
  y: any
  xAxis: any
  yAxis: any
  svg: any
  g: any
  stats: any
  statsFiltered: any = []
  selectedMedals: string[] = []
  selectedCountries: string[] = []
  max: number

  perfStats: any
  econStats: any
  q: any

  dummyCountry: any = "BRA"
  countryPos: any
  oddnum: any
  betterC: any
  worseC: any
  myC: any
  requiredInvestment: any

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

  constructor(private data: DataService, private dataService: DataService, private loaderService: LoaderService, private analyticsLoaderService: AnalyticsLoaderService) {
    this.width = 750 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
    // this.subscription = this.data.currentMessage.subscribe(message => this.onMessageReceived(message))
    this.subDataUpdated = data.updateReadinessMessage.subscribe(message => this.dataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))
    dataService.analyticsReadinessMessage.subscribe(message => this.analyticsDataReady(message))
    dataService.countryFromMapMessage.subscribe(message => this.countryReady(message))

  }
  countryReady(message) {
    // console.log("testnew", "received data: ", message[0])
    // this.dummyCountry = message[0]
    // console.log("testnew", this.dummyCountry)
    // this.computeData()
  }

  analyticsDataReady(message) {
    if (message == "updated") {
      this.q = this.analyticsLoaderService.q
      this.perfStats = this.analyticsLoaderService.interpolatedPerfDict
      this.econStats = this.analyticsLoaderService.economicDict
      if (this.q.selectedCountry) {
        this.dummyCountry = this.q.selectedCountry
      }
      this.computeData()
    }
  }

  onMouseSelection(message: MouseSelection) {
    console.log("medalchart mouse selection event: ", message)
    if (message.source && message.source !== this.CHART_COMPONENT_TAG) {
      message.currentlySelected ? this.highlight(null, message.noc, this) : this.doNotHighlight(null, message.noc, this)
    }
  }

  computeData() {
    let year = "2016"
    //let sorted = Object.values(this.perfStats[year]).sort()

    let ratios = this.analyticsLoaderService.efficiencyDict
    let investments = this.analyticsLoaderService.investmentDict
    let desiredPos = this.q.desiredPlacing

    let perfObj = {}
    Object.keys(ratios[year]).forEach(noc => {
      if (noc == this.dummyCountry && this.q.desiredInvestment != 6000000) {
        let invertedPerf = ratios[year][noc]*(this.q.desiredInvestment/1000000)/100
        console.log("test pred", this.q.desiredInvestment/1000000, 1/invertedPerf)
        perfObj[noc]=1/invertedPerf
      }
      else{
        let invertedPerf = ratios[year][noc]*investments[year][noc]/100 //ratio is multiplied by 100,000,000 and investment is divided by 1,000,000
        perfObj[noc]=1/invertedPerf
      }
    })

    let sorted = Object.values(perfObj).sort()

    if (desiredPos) {
      let targetPerf = sorted[desiredPos] as number
      let invertedPerf = 1/targetPerf
      let dummyRatio = ratios[year][this.dummyCountry]
      let expectedInvestment = (invertedPerf/(dummyRatio)*100)
      this.requiredInvestment = expectedInvestment*1000000

    }
    let i = 0
    let sortedObj = {} 
    for (let sValue of sorted) {
      i++
      if (desiredPos) {
        if (i == desiredPos) {
          sortedObj[this.dummyCountry] = sorted[desiredPos-1] as number
        }
      }
      Object.entries(perfObj).find(([key, value]) => {
        if (value == sValue) {
          if (desiredPos) {
            if (key != this.dummyCountry) {
              sortedObj[key] = value
            }
          }
          else{
            sortedObj[key] = value
          }
        }
      })
    }
    let sortedCountries = Object.keys(sortedObj)
    let sortedVals = Object.values(sortedObj)    
    let ind = sortedCountries.indexOf(this.dummyCountry)
    this.countryPos = ind+1
    let start, end = 0
    let finalCountries = []
    let finalValues = []
    let finalObj = []

    delete this.myC
    delete this.betterC
    delete this.worseC

    let oddnum = 13
    let others = (oddnum+1)/2
    this.oddnum = oddnum

    if (ind-others>=0 && ind+others<=sortedCountries.length) {
      start = ind-others
      end = ind+others
    } 
    else if (ind-others<0) {
      start = 0
      end = oddnum
    }
    else {
      start = sortedCountries.length-oddnum
      end = sortedCountries.length
    }

    let j = 0
    //console.log("newUpdate", sortedObj)

    let selCountryFlag = false
    for (let i=start; i<=end; i++ ) {
      if (sortedCountries[i] == this.dummyCountry) {
        selCountryFlag = true
        if (!this.myC) {
          console.log("testnew", "new C", i, start, end, Math.floor((end-start)/2), sortedCountries)
          this.myC = []
        }
        this.myC.push(sortedCountries[i])
      }
      if (selCountryFlag == false) {
        if (!this.betterC) {
          this.betterC = []
        }
        this.betterC.push(sortedCountries[i])
      }
      else {
        if (!this.worseC) {
          this.worseC = []
        }
        this.worseC.push(sortedCountries[i])
      }
      finalCountries.push(sortedCountries[i])
      finalValues.push(sortedVals[i])
      finalObj[j] = {
        c: sortedCountries[i],
        v: sortedVals[i]
      }
      j++

    }
    console.log("testnew", this.myC)
    let best = finalObj[0].v

    // Object.keys(finalObj).forEach(ind => {
    //   finalObj[ind].v = finalObj[ind].v - best
    // })
    this.newUpdate(finalObj)

    console.log("newUpdate", finalObj)

    //console.log("testnew", this.econStats)
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
      //this.updateChart()
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
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }



  filterData() {
    // this.goldsFiltered = this.golds.filter(t => this.teamsList.some(t2 => t.team == t2.name && t2.isChecked));
    this.statsFiltered = this.selectedCountries.map(c => this.stats[c])
    this.statsFiltered = this.sort_object_of_objects(this.statsFiltered, "total")
    if (this.selectedTraditionNoc) {
      let traditionDeltas = this.loaderService.traditionDeltas
      let traditionDeltasArray = Object.keys(traditionDeltas).map(noc => {
        return {
          noc: noc,
          value: traditionDeltas[noc]
        }
      })
      traditionDeltasArray.sort((a,b) => a.value-b.value)
      this.statsFiltered = traditionDeltasArray.map(elem => this.statsFiltered.find(s => s.name === elem.noc))
    }
    this.statsFiltered = this.statsFiltered.filter(s => s !== undefined)
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
        if (data[prop]) {
          obj[prop] = data[prop];
          obj.tempSortName = Number(data[prop][attr]);
          arr.push(obj)
        }
      }
    }

    arr.sort(function (a, b) {
      let at = a.tempSortName,
        bt = b.tempSortName;
      return at > bt ? -1 : (at < bt ? 1 : 0);
    });

    var result = [];
    for (let i = 0, l = arr.length; i < l; i++) {
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
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 70, left: 60 }

    this.color = ColorScale

    // append the svg object to the body of the page
    this.svg = d3Sel.select("#predChart")
      .append("svg")
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 790 420')
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Initialize the X axis
    this.x = d3.scaleLinear()
      .range([0, this.width])
    this.xAxis = this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")

    // Initialize the Y axis
    this.y = d3.scaleBand()
    .padding(0.2)
    .range([0, this.height]);
    this.yAxis = this.svg.append("g")
      .attr("class", "myYaxis")
  }

  highlight(ev, d, c) {
    if (typeof d === 'string') {
      //TODO if Noc received is in the bars
      c.currentCountryNoc = d
    } else {
      c.currentSelected = d
      c.currentCountryNoc = c.currentSelected.c
      this.dataService.updateMouseSelection({
        currentlySelected: true,
        noc: c.currentCountryNoc,
        source: this.CHART_COMPONENT_TAG
      })
    }

    console.log("testnew", "highlight", d)

    d3.selectAll(".medalBar")
      .transition().duration(200)
      .style("opacity", "0.2")
    // Second the hovered specie takes its color
    d3.select("#bar-" + c.currentCountryNoc)
      .transition().duration(200)
      .style("opacity", "1")

  }

  doNotHighlight(ev, d, c) {
    if (typeof d !== 'string') {
      this.dataService.updateMouseSelection({
        currentlySelected: false,
        noc: c.currentCountryNoc,
        source: this.CHART_COMPONENT_TAG
      })
    }
    c.currentSelected = {}
    c.currentCountryName = ""
    d3.selectAll(".medalBar")
      .transition().duration(200).delay(200)
      .style("opacity", 1)
  }

  getLabel(): string {
    let labelText = 'Medals'
    let query = this.loaderService.query

    query.tradition && (labelText += " (tradition)")
    query.normalize && (labelText+= " normalized")

    query.medalsByPop && (labelText += "/country population")
    query.medalsByGdp && (labelText += "/gdp")

    return labelText
  }
  
  newUpdate(data) {
    this.y.domain(data.map(function (d) {
      if (d) {
        return d.c
      }
      return ""
    }))

    var InvLabelX = this.width/2;
    var InvLabelY = 0;

    if (this.q.desiredPlacing){
      this.svg.select("#InvestmentLabel").remove()
      this.svg.select("#PlacingLabel").remove()
      this.svg.append("g")
        .attr('id', "InvestmentLabel")
        .attr('transform', 'translate(' + InvLabelX + ', ' + InvLabelY + ')')
        .append('text')
        .attr('text-anchor', 'middle')
        .text("Expected Investment: " + Math.floor(this.requiredInvestment) + " pounds")
        .style("fill", "white");
    }
    if (this.q.desiredInvestment != 6000000){
      this.svg.select("#PlacingLabel").remove()
      this.svg.select("#InvestmentLabel").remove()
      this.svg.append("g")
        .attr('id', "PlacingLabel")
        .attr('transform', 'translate(' + InvLabelX + ', ' + InvLabelY + ')')
        .append('text')
        .attr('text-anchor', 'middle')
        .text("Expected placement: #" + this.countryPos)
        .style("fill", "white");
    }

    var XaxisLabelX = this.width/2;
    var XaxisLabelY = this.height + 35;
    let labelText = this.getLabel()
    this.svg.select("#PredictChartLabelX").remove()
    this.svg.append("g")
      .attr('id', "PredictChartLabelX")
      .attr('transform', 'translate(' + XaxisLabelX + ', ' + XaxisLabelY + ')')
      .append('text')
      .attr('text-anchor', 'middle')
      .text("Seconds")
      .style("fill", "white");

    // Update the Y axis
    this.x.domain([data[0].v-0.2, data[this.oddnum].v+0.1])
    this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x))
    this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y));
    this.svg.selectAll(".medalBar").remove()
    var u = this.svg.selectAll(".medalBar").data(data)

    let colors: string[] = ["#ff7f0e", "#2ca02c", "#9467bd", "#e377c2", "#bcbd22"]
    let myCountries = []
    if (this.q.countries) {
      myCountries = this.q.countries
      console.log("testnew", myCountries)
    }

    u
      .enter()
      .append('rect')
      //.attr('class', 'bar') // Add a new rect for each new elements
      .attr('class', 'medalBar') // Add a new rect for each new elements
      .attr('id', d => 'bar-'+ d.c)
      .merge(u) // get the already existing elements as well
      .on("mouseover", (event, d) => this.highlight(event, d, this))
      .on("mouseleave", (event, d) => this.doNotHighlight(event, d, this))
      .attr('x', 0)
      .attr('y', (d) => this.y(d && d.c))
      .attr('width', (d) => this.x(d && d.v))
      .attr('height', this.y.bandwidth())
      .attr("fill", d => {
        // if (myCountries.includes(d.c)) {
        //   return colors[myCountries.indexOf(d.c)]
        // }
        if (this.betterC && this.betterC.includes(d.c)) {
          return "DodgerBlue"
        }
        else if (this.myC.includes(d.c)) {
          return "#bcbd22"
        }
        else if (this.worseC && this.worseC.includes(d.c)) {
          return "FireBrick"
        }
        else {
          return "black"
        }
      })
      .style("outline-color", "initial")
      .style("outline-style", "solid")
      .style("outline-width", (d) => this.selectedTraditionNoc === d.c ? "3px" : "0px")

      .attr('id', d => 'bar-' + d.c)
      // .style("outline", (d) => this.currentCountryNoc === d.name ? "3px solid !important;": "10px solid !important;")
      .transition() // and apply changes to all of them
      .duration(1000)

    // If less group in the new dataset, I delete the ones not in use anymore
    u
      .exit()
      .remove()
  }
}
