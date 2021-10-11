import { WHITE_ON_BLACK_CSS_CLASS } from '@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as Plotly from 'plotly.js/dist/plotly'
import { Subscription } from 'rxjs';
import { AfricaColor, AsiaColor, ColorScale, ColorScaleDark, MouseSelection, PCAEntry } from 'src/data/data';
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

  plotted: boolean = false

  showSpinner: boolean = false

  constructor(private dataService: DataService, private loaderService: LoaderService) {
    this.subPCAReady = dataService.pcaDataReadyMessage.subscribe(message => message && this.dataReady(message))
    dataService.updateMouseSelectionMessage.subscribe(message => this.onMouseSelection(message))
    dataService.updateReadinessMessage.subscribe(message => message && message.length > 0 && (this.showSpinner = true))



  }

  highlight(noc: string) {
    let updatedColors = this.extractColors(this.entries, noc)
    let update = {
      marker: {
        size: 10,
        color: updatedColors,
        line: {
          color: 'rgba(0, 0, 0, 1)',
          width: 0.1
        },
        opacity: 1
      }
    }
    Plotly.restyle(this.plotlyDivId, update)
  }

  doNotHighlight() {
    let updatedColors = this.extractColors(this.entries)
    let update = {
      marker: {
        size: 10,
        color: updatedColors,
        line: {
          color: 'rgba(0, 0, 0, 1)',
          width: 0.1
        },
        opacity: 1
      }
    }
    Plotly.restyle(this.plotlyDivId, update)
  }

  onMouseSelection(message: MouseSelection) {
    console.log("scatterplot got selection event", message)
    if (this.plotted && message.currentlySelected && message.source !== ScatterplotComponent.name) {
      let selectedNoc = message.noc
      this.highlight(selectedNoc)
    }
    if (this.plotted && !message.currentlySelected && message.source !== ScatterplotComponent.name) {
      this.doNotHighlight()
    }

  }

  dataReady(entries: PCAEntry[]): void {
    this.showSpinner = false
    console.log("plotting: data ready...")
    this.entries = entries
    this.plot3d()
  }

  ngOnInit(): void {
    // this.plot()
  }



  extractComponents(entries: PCAEntry[], type: string, attr?: string) {
    let res = attr ? entries.map(e => e[type][attr]) : entries.map(e => e[type])
    return res
  }

  extractLabels(entries: PCAEntry[]) {
    let res = entries.map(e => {
      let result =
        "NOC: " + e.details["NOC"] + "<br>" +
        "Sport: " + e.details["Sport"] + "<br>" +
        "Year: " + e.details["Year"] + "<br>" +
        "Medals:" + e.details["Totmedals"] + "<br>" +
        "Sex:" + e.details["Sex"] + "<br>"
      if (e.details["Gdp"]) {
        result += ("Gdp: " + e.details["Gdp"] + "<br>")
      }
      if (e.details["Pop"]) {
        result += ("Pop: " + e.details["Pop"] + "<br>")
      }
      return result
    })
    return res
  }

  extractColors(entries: PCAEntry[], customNoc?: string) {

    // non possiamo ridurre l'opacità degli elemento non selezionati come facciamo altrove perché altrimenti
    // dove i punti sono sovrapposti il colore risultante è completamente bianco; l'idea è di rendere
    // gli altri punti più scuri, tranne quelli del noc selezionato

    let colorsLight = ColorScale
    let colorsDark = ColorScaleDark

    if (customNoc) {
      return entries.map(e => customNoc === e.details["NOC"] ? colorsLight(this.loaderService.countries[e.details["NOC"]].continent) : colorsDark(this.loaderService.countries[e.details["NOC"]].continent))
    }
    return entries.map(e => colorsLight(this.loaderService.countries[e.details["NOC"]].continent))

  }

  plot3d() {

    let entries = this.entries
    console.log("plotting pca...", entries)

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
        "%{text}<br>" +
        "x: %{x:.3f}, " +
        "y: %{y:.3f}, " +
        "z: %{z:.3f}" +
        "<extra></extra>",
      marker: {
        size: 10,
        color: c,
        line: {
          color: 'rgba(0, 0, 0, 1)',
          width: 0.1
        },
        opacity: 1
      },
      type: 'scatter3d'
    };

    var data = [trace1];

    let config = {
      modeBarButtonsToRemove: ['toImage', 'zoom3d', 'resetCameraLastSave3d', 'hoverClosest3d', 'orbitRotation'],
      responsive: true,
      displaylogo: false
    }

    var layout = {
      modebar: {
        bgcolor: 'rgba(0,0,0,0)',
        pan3d: {
          color: 'white'
        }
      },
      hovermode: "closest",
      hoverlabel: {
        bordercolor: "rgba(24, 21, 39, 1)",
        bgcolor: 'rgba(24, 21, 39, 1)',
        font: {
          color: 'rgba(255,255,255,1)'
        }
      },
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
      if (this.plotted && this.entries.length > 0) {

        let d, newSelected
        data && data.points && data.points.length > 0 && (d = data.points[0])
        d.data.id[d.pointNumber] && (newSelected = d.data.id[d.pointNumber])

        if (newSelected && (!this.currentlySelectedNoc || newSelected !== this.currentlySelectedNoc)) {
          console.log("scatterplot got hover on:" + newSelected)
          this.currentlySelectedNoc = newSelected
          this.dataService.updateMouseSelection({
            currentlySelected: true,
            noc: newSelected,
            source: ScatterplotComponent.name
          })
          this.highlight(newSelected)
        }
      }
    })

    plot.on('plotly_unhover', _ => {
      if (this.currentlySelectedNoc && this.plotted && this.entries.length > 0) {
        this.dataService.updateMouseSelection({
          currentlySelected: false,
          noc: this.currentlySelectedNoc,
          source: ScatterplotComponent.name
        })
        this.currentlySelectedNoc = undefined
        this.doNotHighlight()
      }
    })

    this.plotted = true
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
