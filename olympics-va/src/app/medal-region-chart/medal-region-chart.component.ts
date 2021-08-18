import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataService } from "../data.service";
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import * as d3Array from 'd3-array';
import { Team, Teams } from 'src/data/data';

@Component({
  selector: 'app-medal-region-chart',
  templateUrl: './medal-region-chart.component.html',
  styleUrls: ['./medal-region-chart.component.css']
})
export class MedalRegionChartComponent implements OnInit {

  width: number;
  height: number;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  x: any
  y: any
  xAxis: any
  yAxis: any
  svg: any
  g: any

  medals: MedalsEntry[] = []
  medalsFiltered: MedalsEntry[] = []

  @Input()
  teamsList: Team[] = Teams;
  subscription: Subscription;


  constructor(private data: DataService) {
  this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.subscription = data.currentMessage.subscribe(message => this.onMessageReceived(message))

  }

  ngOnInit(): void {
    this.initData()
  }

  initChart() {

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 70, left: 60 }

    // append the svg object to the body of the page
    this.svg = d3Sel.select("#barChartRegionMedals")
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

  getRatio(d: MedalsEntry){
    if(d.population == 1){
      return 0
    }
    return d.golds*1000000/d.population
  }

  updateChart() {
    // Update the X axis
    this.x.domain(this.medalsFiltered.map(function(d) { return d.team }))
    this.xAxis.call(d3.axisBottom(this.x))

    // Update the Y axis
    // this.y.domain([0, d3Array.max(this.medalsFiltered, (d) => (d.population != 1 ? d.golds*100000/d.population : 0))]);
    this.y.domain([0, d3Array.max(this.medalsFiltered, (d) => this.getRatio(d))]);
    //this.y.domain([0, d3Array.max(this.medalsFiltered, (d) => d.golds)]);
    this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y));

    var u = this.svg.selectAll(".medalBarRegion").data(this.medalsFiltered)

    u
      .enter()
      .append('rect')
      .attr('class', 'bar') // Add a new rect for each new elements
      .attr('class', 'medalBarRegion') // Add a new rect for each new elements
      .merge(u) // get the already existing elements as well
      .transition() // and apply changes to all of them
      .duration(1000)
      .attr('x', (d) => this.x(d.team))
      .attr('y', (d) => this.y(this.getRatio(d)))
      .attr('width', this.x.bandwidth())
      .attr('height', (d) => this.height - this.y(this.getRatio(d)))
      .attr("fill", "#69b3a2")

    // If less group in the new dataset, I delete the ones not in use anymore
    u
      .exit()
      .remove()
  }



  onMessageReceived(message) {
    this.teamsList = message
    if (this.medals.length > 0) {
      this.filterData()
      this.updateChart()
    }
  }

  initData() {
    let medals = this.medals
    d3.csv("/assets/data/athlete_events.csv").then(function (data) {
      let dict: any = {}
      for (let i = 0; i < data.length; i++) {
        let team = data[i].Team || {}
        if (!dict[team]) {
          let entry: MedalsEntry = {
            team: team,
            population: 1,
            golds: 0,
            bronze: 0,
            silver: 0
          }
          dict[team] = entry
        }
        if (data[i].Medal === "Gold") {
          dict[team].golds++
        } else if (data[i].Medal === "Silver") {
          dict[team].silver++
        } else if (data[i].Medal === "Bronze") {
          dict[team].bronze++
        }
      }
      let medalsArray: MedalsEntry[] = Object.values(dict)
      for (let elem of medalsArray){
        medals.push(elem)
      }
    }.bind(this)).then(
        this.initPopulationData.bind(this)
    )
  }

  initPopulationData() {
    let medals = this.medals
    d3.csv("/assets/data/population.csv").then(function (data) {
      for (let i = 0; i < data.length; i++) {
        let team = data[i].Team || {} 
        let entry = medals.find(entry => entry.team === team)
        if(entry != undefined) {
          entry.population = data[i].AVG
        }
      }
    }.bind(this)).then(this.onDataInitialized.bind(this))
  }

  onDataInitialized() {
    console.log(this.medals)
    this.filterData()
    this.initChart()
    this.updateChart()
  }

  filterData() {
    this.medalsFiltered = this.medals.filter(t => this.teamsList.some(t2 => t.team == t2.name && t2.isChecked));
  }


}

export interface MedalsEntry {
  team: string;
  population: number;
  golds: number;
  silver: number;
  bronze: number;
}