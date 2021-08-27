import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { DataService } from "../data.service";
import { Subscription } from 'rxjs';
import { requiredYearRange, Team, Teams } from 'src/data/data';
import { Options } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-medal-conf',
  templateUrl: './medal-conf.component.html',
  styleUrls: ['./medal-conf.component.css']
})

export class MedalConfComponent implements OnInit {

  formTeams: FormGroup
  teamsList: Team[] = Teams
  subscription: Subscription;
  yearRangeSubscription: Subscription;

  yearRange: number[]
  sliderOptions: Options = {
    floor: 1920,
    ceil: 2016
  };

  constructor(private formBuilder: FormBuilder, private data: DataService) {
    this.formTeams = this.formBuilder.group({
      teams: this.formBuilder.array([], [Validators.required])
    })
    this.subscription = this.data.currentMessage.subscribe(message => this.teamsList = message)
    this.yearRangeSubscription = this.data.changedYearRangeMessage.subscribe(message => this.yearRange = message)

  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onCheckboxChange(e) {
    const teams: FormArray = this.formTeams.get('teams') as FormArray;
    let item = this.teamsList.find(({ id }) => id == e.target.value )
    if (e.target.checked) {
      teams.push(new FormControl(e.target.value));
      item && (item.isChecked = true)
    } else {
       const index = teams.controls.findIndex(x => x.value === e.target.value);
       item && (item.isChecked = false)
       teams.removeAt(index);
    }  
    this.data.changeMessage(this.teamsList)
    console.log(this.teamsList)
  }

  onYearSliderChange(e) {
    this.data.changeYearRange(this.yearRange)
    // console.log(e)
  }
    
  submit(){
    console.log(this.formTeams.value);
  }

}
