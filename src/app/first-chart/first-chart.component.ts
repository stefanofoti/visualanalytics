import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-first-chart',
  templateUrl: './first-chart.component.html',
  styleUrls: ['./first-chart.component.css']
})

export class FirstChartComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    var svg = d3.select("svg");
    svg.selectAll("circle")
      .on("mouseover",
        function () {
          d3.select(this)
            .attr("class", "green")
            .attr("r", "60");
        }
      );
    svg.selectAll("circle")
      .on("mouseout",
        function () {
          d3.select(this)
            .attr("class", "red")
            .attr("r", "30");
        }
      );
  }



}
