import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as tjson from 'topojson';
import * as d3geo from 'd3-geo'
import * as d3tip from 'd3-tip'
import { color, max, select } from 'd3';
import { LoaderService } from '../loader.service';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs';
import { bronzes, golds, Medal, silvers, Stat } from 'src/data/data';

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

  private subDataReadiness: Subscription
  private subYearRangeChanged: Subscription
  private subSelectedMedals: Subscription
  private isDataReady: Boolean = false
  private yearsRange: number[]
  selectedMedals: string[]
  selectedStats: Stat
  stats: {}

  constructor(private loaderService: LoaderService, private dataService: DataService) {
    this.subYearRangeChanged = dataService.changedYearRangeMessage.subscribe(message => this.onYearRangeChanged(message))
    this.subDataReadiness = dataService.olympycsReadinessMessage.subscribe(message => this.dataReady(message))
    this.subSelectedMedals = dataService.selectedMedalsMessage.subscribe(message => this.onSelectedMedalsChanged(message))
  }

  ngOnInit(): void {
    this.initMap()
  }

  dataReady(isReady: Boolean): any {
    if(isReady) {
      this.isDataReady = true
      this.onYearRangeChanged(this.yearsRange)
      // this.updateMap()
    }
  }

  onSelectedMedalsChanged(message: Medal[]) {
    this.selectedMedals = []
    message.forEach(m => {
      m.isChecked && this.selectedMedals.push(m.id)
    })
    this.updateMap()
  }

  updateMap() {
    if(this.isDataReady) {
      let [stats, max] = this.loaderService.computeMedalsByNationInRange(this.yearsRange[0], this.yearsRange[1], this.selectedMedals)
      this.stats = stats
      let maximum = Number(max)
      console.log("maximum amount of medals: " + maximum)
      this.g.selectAll("path").attr("fill", function(d, event) {
        let currentNOC = d.properties.NOC
        let team = stats[currentNOC]
        if (team) {
          var intensity = team.total*100/maximum
          if (currentNOC === "MAD") {
            console.log (team.total)
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

  }

  onYearRangeChanged(newRange: number[]){
    this.yearsRange = newRange
    this.updateMap()
  }

  /*
  updateMap(): void {
    var maxmedals = 1200
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
      .attr("width", "100%")
      .attr("height", this.height);

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

    console.log(this.loaderService.olympicsDict)
    /*this.g.selectAll("path")
      .on("mouseover", function() {
        console.log("got hover")
        //d3.select(item).attr("fill", "#f98bfc")
      })*/
  }


  drawMap(topology): void {
    const div = this.div
    let context = this
    this.g.selectAll("path")
      .data(tjson.feature(topology, topology.objects.countries).features)
      .enter().append("path")
      .attr("d", this.path)
      //.attr("fill", "#000000")
      .on("mouseover", function(event,d) {
        //console.log(d)
        context.selectedStats = context.stats[d.properties.NOC]
        context.selectedStats.name = d.properties && d.properties.name || ""
        console.log(context.selectedStats)
        d3.select(event.currentTarget).attr("opacity", "50%")
        })
      .on("mouseout", function(event, d) {
        context.selectedStats = undefined
        d3.select(event.currentTarget).attr("opacity", "100%")
        })
  }

}
