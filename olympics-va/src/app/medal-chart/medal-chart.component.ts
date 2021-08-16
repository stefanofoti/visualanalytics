import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sel from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
@Component({
  selector: 'app-medal-chart',
  templateUrl: './medal-chart.component.html',
  styleUrls: ['./medal-chart.component.css']
})

export class MedalChartComponent implements OnInit {

  width: number;
  height: number;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  x: any
  y: any
  svg: any
  g: any
  golds: GoldEntry[] = []



  constructor() {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit(): void {
    this.plotGraph()
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

  initAxis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.golds.map((d) => d.team));
    this.y.domain([0, d3Array.max(this.golds, (d) => d.golds)]);
  }

  drawAxis() {
    this.g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
    this.g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency');
  }

  drawBars() {
    this.g.selectAll('.bar')
      .data(this.golds)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => this.x(d.team))
      .attr('y', (d) => this.y(d.golds))
      .attr('width', this.x.bandwidth())
      .attr('fill', '#498bfc')
      .attr('height', (d) => this.height - this.y(d.golds));
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
    this.initSvg()
    this.initAxis()
    this.drawAxis()
    this.drawBars()
  }

  initData() {
    let golds = this.golds
    d3.csv("/assets/data/athlete_events.csv").then(function (data) {
      let dict: any = {}
      for (let i = 0; i < 20000/*data.length*/; i++) {
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
