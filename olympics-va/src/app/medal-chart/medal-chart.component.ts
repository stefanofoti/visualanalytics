import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataService } from "../data.service";
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { Team, Teams } from 'src/data/data';
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
  golds: GoldEntry[] = []
  goldsFiltered: GoldEntry[] = []

  @Input()
  teamsList: Team[] = Teams;
  subscription: Subscription;

  constructor(private data: DataService) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.subscription = this.data.currentMessage.subscribe(message => this.onMessageReceived(message))
  }

  onMessageReceived(message) {
    this.teamsList = message
    if (this.golds.length > 0) {
      this.filterData()
      this.updateChart()
    }
  }

  ngOnInit(): void {
    this.plotGraph()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initSvg() {
    this.svg = d3Sel.select('#barChartMedals')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 900 500');
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  plotGraph() {
    this.initData()
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
    console.log(this.golds)
    this.filterData()
    this.initChart()
    this.updateChart()
  }

  filterData() {
    this.goldsFiltered = this.golds.filter(t => this.teamsList.some(t2 => t.team == t2.name && t2.isChecked));
  }

  initChart() {
    //this.initSvg()

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 70, left: 60 }

    // append the svg object to the body of the page
    this.svg = d3Sel.select("#barChartMedals")
      .append("svg")
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 900 500')
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

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


  updateChart() {
    // Update the X axis
    this.x.domain(this.goldsFiltered.map(function(d) { return d.team }))

    //this.x.domain(this.goldsFiltered.map((d) => d.team));
    this.xAxis.call(d3.axisBottom(this.x))

    // Update the Y axis
    this.y.domain([0, d3Array.max(this.goldsFiltered, (d) => d.golds)]);
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
    var u = this.svg.selectAll(".medalBar").data(this.goldsFiltered)

    u
      .enter()
      .append('rect')
      .attr('class', 'bar') // Add a new rect for each new elements
      .attr('class', 'medalBar') // Add a new rect for each new elements
      .merge(u) // get the already existing elements as well
      .transition() // and apply changes to all of them
      .duration(1000)
      .attr('x', (d) => this.x(d.team))
      .attr('y', (d) => this.y(d.golds))
      .attr('width', this.x.bandwidth())
      .attr('height', (d) => this.height - this.y(d.golds))
      .attr("fill", "#69b3a2")

    // If less group in the new dataset, I delete the ones not in use anymore
    u
      .exit()
      .remove()
  }


  initData() {
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

}

export interface GoldEntry {
  team: string;
  golds: number;
}
