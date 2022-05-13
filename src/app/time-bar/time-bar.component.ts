import { Component, OnInit } from '@angular/core';
import { DataService } from "../data.service";
import { requiredAnalyticsYearRange } from 'src/data/data';
import { Options } from '@angular-slider/ngx-slider';
import { boolean } from 'mathjs';

@Component({
  selector: 'app-time-bar',
  templateUrl: './time-bar.component.html',
  styleUrls: ['./time-bar.component.css']
})
export class TimeBarComponent implements OnInit {

  COMPONENT_TAG = "TIME_BAR_COMPONENT"


  ignoreNextCall: boolean = true
  yearRange =  [2004,2020]
  sliderOptions2: Options = {
    floor: requiredAnalyticsYearRange[0],
    ceil: requiredAnalyticsYearRange[1]
  };

  constructor(private data: DataService) {

    data.changedYearRangeMessage.subscribe(message => {
      this.extYearSliderChange(message)
    })
   }

  ngOnInit(): void {
  }

  extYearSliderChange(message) {
    if (!this.ignoreNextCall){
      this.yearRange = message
    }
    else{
      this.ignoreNextCall = false
    }
  }
  onYearSliderChange(message) {
    if(message.value){
      this.yearRange[0] = message.value
      console.log("test", this.yearRange)
    }else if ( message.valueHigh){
      this.yearRange[1] = message.valueHigh
      console.log("test", this.yearRange)
    }
    this.ignoreNextCall = true
    this.data.changeYearRange(this.yearRange)
  }

}
