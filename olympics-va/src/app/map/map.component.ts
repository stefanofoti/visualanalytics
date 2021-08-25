import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as tjson from 'topojson';
import * as d3geo from 'd3-geo'
import * as d3tip from 'd3-tip'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  private width = 960
  private height = 500
  private svg: any
  private g: any
  private path: any
  constructor() { }

  ngOnInit(): void {
    this.initMap()
  }

  initMap(): void {

    
    var projection = d3geo.geoMercator()
    .scale(80)
      .translate([this.width/2,this.height/2])

    
    /*d3.geoMercator()
      .center([-30, -20])
      .scale(80)
      .rotate([-180, 0]);
*/
    this.svg = d3.select("svg")
      .attr("width", this.width)
      .attr("height", this.height);


    this.path = d3.geoPath()
      .projection(projection);
      

    this.g = this.svg.append("g");

    d3.json("/assets/data/map.json").then(topology => this.drawMap(topology));

  }


  drawMap(topology): void {
    this.g.selectAll("path")
    .data(tjson.feature(topology, topology.objects.countries).features)
    .enter().append("path")
    .attr("d", this.path)

  }

}
