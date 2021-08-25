import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as tjson from 'topojson';
import * as d3geo from 'd3-geo'
import * as d3tip from 'd3-tip'
import { color, select } from 'd3';
import { LoaderService } from '../loader.service';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  private width = 1200
  private height = 500
  private svg: any
  private g: any
  private path: any
  private div: any

  private subscription: Subscription

  constructor(private loaderService: LoaderService, private dataService: DataService) {
    this.subscription = dataService.olympycsReadinessMessage.subscribe(message => this.dataReady(message))
  }

  ngOnInit(): void {
    this.initMap()
  }

  dataReady(isReady: Boolean): any {
    if(isReady) {
      this.updateMap()
    }
  }

  updateMap(): void {
    this.g.selectAll("path").attr("fill", "#ffff00")
  }

  initMap(): void {
    console.log("initMap method")
    var projection = d3geo.geoNaturalEarth1()
      .scale(180)
      .translate([this.width / 2, this.height / 2])


    /*d3.geoMercator()
      .center([-30, -20])
      .scale(80)
      .rotate([-180, 0]);
*/
    this.svg = d3.select("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
  

    this.path = d3.geoPath()
      .projection(projection);


    this.g = this.svg.append("g");
    console.log("original g:")
    console.log(this.g)

    d3.json("/assets/data/map2.json").then(topology => this.drawMap(topology));
    const g = this.g

    var zoom: any = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function (event) {
        g.selectAll('path')
          .attr('transform', event.transform);
        g.selectAll("circle")
          .attr('transform', event.transform);
        g.selectAll("text")
          .attr('transform', event.transform);
      });

    this.svg.call(zoom);

    console.log(this.loaderService.data)
    /*this.g.selectAll("path")
      .on("mouseover", function() {
        console.log("got hover")
        //d3.select(item).attr("fill", "#f98bfc")
      })*/
  }


  drawMap(topology): void {
    const div = this.div
    this.g.selectAll("path")
      .data(tjson.feature(topology, topology.objects.countries).features)
      .enter().append("path")
      .attr("d", this.path)
      //.attr("fill", "#000000")
      .on("mouseover", function(event,d) {
        console.log(d)
        d3.select(event.currentTarget).attr("fill", "#1010c7")
        })
      .on("mouseout", function(event, d) {
        d3.select(event.currentTarget).attr("fill", "#000000")
        })
      .attr("fill", function(d){
        if(d.properties.name === "Italy") return "#ff00fa"
        return "#000000"
      })
  }

}
