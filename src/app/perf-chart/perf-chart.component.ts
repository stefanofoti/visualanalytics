import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-perf-chart',
  templateUrl: './perf-chart.component.html',
  styleUrls: ['./perf-chart.component.css']
})
export class PerfChartComponent implements OnInit {

  constructor(private loaderService: LoaderService) { }

  ngOnInit(): void {
  }

}
