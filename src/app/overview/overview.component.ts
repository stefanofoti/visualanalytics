import { Component, OnInit } from '@angular/core';
import { ScatterConf } from 'src/data/data';
import { ConfComponent } from '../conf/conf.component';
import { DataService } from '../data.service';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {


  scatterConf

  constructor() { 
  }

  ngOnInit(): void {
    this.scatterConf = ScatterConf
  }

}
