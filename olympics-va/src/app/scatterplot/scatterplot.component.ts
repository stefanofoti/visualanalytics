import { WHITE_ON_BLACK_CSS_CLASS } from '@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as Plotly from 'plotly.js/dist/plotly'
import { Subscription } from 'rxjs';
import { MouseSelection, PCAEntry } from 'src/data/data';
import { DataService } from '../data.service';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.css']
})
export class ScatterplotComponent implements OnInit {

  plotlyDivId = "scatterplot_id"

  subPCAReady: Subscription

  entries: PCAEntry[] = []

  currentlySelectedNoc: string

  plot: any

  constructor(private dataService: DataService, private loaderService: LoaderService) {
    this.subPCAReady = dataService.pcaDataReadyMessage.subscribe(message => this.dataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))

  }

  onMouseSelection(message: MouseSelection) {
    console.log("scatterplot got selection event")
    if (message.currentlySelected && message.source !== ScatterplotComponent.name) {
      let selectedNoc = message.noc
      let updatedColors = this.extractColors(this.entries, selectedNoc)
      let update = {
        marker: {
          color: updatedColors
        }
      }
      Plotly.restyle(this.plotlyDivId, update)
    }
    if (!message.currentlySelected && message.source !== ScatterplotComponent.name) {
      let updatedColors = this.extractColors(this.entries)
      let update = {
        marker: {
          color: updatedColors
        }
      }
      Plotly.restyle(this.plotlyDivId, update)
    }

  }

  dataReady(entries: PCAEntry[]): void {
    console.log("plotting: data ready...")
    this.entries = entries
    this.entries.length > 0 && this.plot3d()
  }

  ngOnInit(): void {
    // this.plot()
  }



  extractComponents(entries: PCAEntry[], type: string, attr?: string) {
    let res = attr ? entries.map(e => e[type][attr]) : entries.map(e => e[type])
    return res
  }

  extractLabels(entries: PCAEntry[]) {
    let res = entries.map(e =>
      "noc: " + e.details["NOC"] + "<br>" +
      "sport: " + e.details["Sport"] + "<br>" +
      "year: " + e.details["Year"] + "<br>"
    )
    return res
  }

  extractColors(entries: PCAEntry[], customNoc?: string) {

    // non possiamo ridurre l'opacità degli elemento non selezionati come facciamo altrove perché altrimenti
    // dove i punti sono sovrapposti il colore risultante è completamente bianco; l'idea è di rendere
    // gli altri punti più scuri, tranne quelli del noc selezionato
    let lightColorRange = ["#0085c7", "#ff4f00", "#f4c300", "#f4c300", "#7851A9", "#009f3d"]
    let darkColorRange = ["#002c42", "#541b00", "#6e5800", "#6e5800", "#322245", "#08451f"]

    if(customNoc) {
      

    }

    let colors = d3.scaleOrdinal()
      .domain(["Asia", "Africa", "North America", "South America", "Europe", "Oceania"])
      .range(customNoc ? darkColorRange : lightColorRange)

    return entries.map(e => customNoc === e.details["NOC"] ? "#ffffff" : colors(this.loaderService.countries[e.details["NOC"]].continent))
  }

  plot3d() {
    let entries = this.entries
    console.log("plotting pca...")

    let x = this.extractComponents(entries, "x")
    let y = this.extractComponents(entries, "y")
    let z = this.extractComponents(entries, "z")
    let nocs = this.extractComponents(entries, "details", "NOC")


    let text = this.extractLabels(entries)

    let c = this.extractColors(entries)




    var trace1 = {
      x: x,
      y: y,
      z: z,
      mode: 'markers',
      text: text,
      id: nocs,
      hovertemplate:
        "<b>%{text}</b><br><br>" +
        "y: %{y:.0f}<br>" +
        "x: %{x:.0f}<br>" +
        "z: %{x:.0f}<br>" +
        "<extra></extra>",
      marker: {
        size: 10,
        color: c,
        line: {
          color: 'rgba(217, 217, 217, 1)',
          width: 0.1
        },
        opacity: 1
      },
      type: 'scatter3d'
    };

    var data = [trace1];

    let config = {
      responsive: true
    }

    var layout = {
      //autosize: true,
      //width: "100%",
      //height:"30vh",
      scene: {
        xaxis: {
          color: 'white'
        },
        yaxis: {
          color: 'white'
        },
        zaxis: {
          color: 'white'
        }
      },
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
      }
    };
    this.plot = Plotly.newPlot(this.plotlyDivId, data, layout, config);

    let plot: any = document.getElementById(this.plotlyDivId)

    plot.on('plotly_hover', data => {
      if (this.entries.length > 0) {

        let d, newSelected
        data && data.points && data.points.length > 0 && (d = data.points[0])
        d.data.id[d.pointNumber] && (newSelected = d.data.id[d.pointNumber])

        if (!this.currentlySelectedNoc || newSelected !== this.currentlySelectedNoc) {
          console.log("scatterplot got hover on:" + newSelected)
          this.currentlySelectedNoc = newSelected
          this.dataService.updateMouseSelection({
            currentlySelected: true,
            noc: newSelected,
            source: ScatterplotComponent.name
          })

        }
      }
    })

    plot.on('plotly_unhover', _ => {
      if (this.entries.length > 0) {
        this.dataService.updateMouseSelection({
          currentlySelected: false,
          noc: this.currentlySelectedNoc,
          source: ScatterplotComponent.name
        })
        this.currentlySelectedNoc = undefined
        console.log("scatterplot got unhover")
      }
    })
  }

  /*

  plot(): void {

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#scatterplot_div")
      .append("svg")
      //.attr("width", width + margin.left + margin.right)
      .attr("width", "100%")
      //.attr("height", height + margin.top + margin.bottom)
      .attr("height", "100%")

      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv").then(function (data) {

      // Add X axis
      const x = d3.scaleLinear()
        .domain([0, 4000])
        .range([0, width]);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      // Add Y axis
      const y = d3.scaleLinear()
        .domain([0, 500000])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add dots
      svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", d => { return x((d as any).GrLivArea); })
        .attr("cy", d => { return y((d as any).SalePrice); })
        .attr("r", 1.5)
        .style("fill", "#69b3a2")

    })
  }
  */
}
