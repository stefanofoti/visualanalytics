import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-medal-chart',
  templateUrl: './medal-chart.component.html',
  styleUrls: ['./medal-chart.component.css']
})
export class MedalChartComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.initGraph()
  }

  initGraph() {
    d3.csv("../../data/athlete_events.csv").then(function(data) {
      for (var i = 0; i < 10; i++) {
          console.log(data[i].Name)
          console.log(data[i].Age)
      }
  })
  }

}
