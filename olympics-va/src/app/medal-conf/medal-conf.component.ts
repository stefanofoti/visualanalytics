import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { DataService } from "../data.service";
import { Observable, Subscription } from 'rxjs';
import { Medal, PreCheckedSports, requiredYearRange, Sport, Team, Teams } from 'src/data/data';
import { Options } from '@angular-slider/ngx-slider';
import { of, pipe } from 'rxjs';
import { map, filter, tap, startWith } from 'rxjs/operators'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipInput } from '@angular/material/chips';


@Component({
  selector: 'app-medal-conf',
  templateUrl: './medal-conf.component.html',
  styleUrls: ['./medal-conf.component.css']
})

export class MedalConfComponent implements OnInit {

  formConf: FormGroup
  teamsList: Team[] = Teams
  medalsList: Medal[]
  subscription: Subscription
  yearRangeSubscription: Subscription
  selectedMedalsSubscription: Subscription
  selectedSportsSubscription: Subscription
  sportsReadinessSubscription: Subscription

  sportsList: Sport[]


  isOlympicsDataReady: Boolean

  //---
  sportControl = new FormControl();

  selectedSports: Sport[] = new Array<Sport>();
  filteredSports: Observable<Sport[]>;
  lastFilter: string = '';
  //----


  yearRange: number[]
  sliderOptions: Options = {
    floor: requiredYearRange[0],
    ceil: requiredYearRange[1]
  };

  constructor(private formBuilder: FormBuilder, private data: DataService) {
    this.formConf = this.formBuilder.group({
      teams: this.formBuilder.array([], [Validators.required]),
      medals: this.formBuilder.array([], [Validators.required])
    })
    this.subscription = this.data.currentMessage.subscribe(message => this.teamsList = message)
    this.yearRangeSubscription = this.data.changedYearRangeMessage.subscribe(message => this.yearRange = message)
    this.selectedMedalsSubscription = this.data.selectedMedalsMessage.subscribe(message => this.medalsList = message)
    this.data.olympycsReadinessMessage.subscribe(message => this.isOlympicsDataReady = message)
    this.sportsReadinessSubscription = this.data.sportsReadinessMessage.subscribe(message => {
      this.sportsList = message
      this.initSportsChecklist()
    })
    this.selectedSportsSubscription = this.data.selectedSportsMessage.subscribe(message => {
      this.selectedSports = message
    })

  }






  ngOnInit(): void {
  }

  initSportsChecklist(): void {
    this.sportsList.forEach(s => { s.isChecked && this.selectedSports.push(s) })
    this.filteredSports = this.sportControl.valueChanges.pipe(
      startWith<string | Sport[]>(''),
      map(value => typeof value === 'string' ? value : this.lastFilter),
      map(filter => this.filter(filter))
    )
  }

  filter(filter: string): Sport[] {
    this.lastFilter = filter;
    let items = this.sportsList
    console.log("sports length: " + this.sportsList.length)
    items.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    items.sort((a,b) => (a.group > b.group) ? 1 : ((b.group > a.group) ? -1 : 0))
    items.sort((a,b) => (!a.isChecked) ? 1 : ((!b.isChecked) ? -1 : 0))
    // TODO
    if (filter) {
      return items.filter(sport => {
        return sport.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0
      })
    } else {
      return items.slice();
    }
  }

  displayFn(value: Sport[]): string | undefined {
    let displayValue: string = "";
    if (Array.isArray(value) && this.isOlympicsDataReady) {
      value.forEach((sport, index) => {
        if (index === 0) {
          displayValue = sport.name;
        } else {
          displayValue += ', ' + sport.name;
        }
      });
    } else {
      PreCheckedSports.forEach((sport, index) => displayValue += (index > 0 ? ", " + sport : sport))
    }
    return displayValue;
  }

  optionClicked(event: Event, sport: Sport) {
    event.stopPropagation();
    this.toggleSelection(sport);
  }

  toggleSelection(sport: Sport) {
    sport.isChecked = !sport.isChecked;
    if (sport.isChecked) {
      this.selectedSports.push(sport);
    } else {
      const i = this.selectedSports.findIndex(value => value.name === sport.name);
      this.selectedSports.splice(i, 1);
    }
    console.log(this.selectedSports)
    this.sportControl.setValue(this.selectedSports);
    this.data.changeSelectedSports(this.selectedSports)

  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
    this.yearRangeSubscription.unsubscribe()
    this.selectedMedalsSubscription.unsubscribe()
  }

  onCheckboxChange(e) {
    const teams: FormArray = this.formConf.get('teams') as FormArray;
    let item = this.teamsList.find(({ id }) => id == e.target.value)
    if (e.target.checked) {
      teams.push(new FormControl(e.target.value));
      item && (item.isChecked = true)
    } else {
      const index = teams.controls.findIndex(x => x.value === e.target.value);
      item && (item.isChecked = false)
      teams.removeAt(index);
    }
    this.data.changeMessage(this.teamsList)
  }

  onMedalsCheckboxChange(e) {
    const medals: FormArray = this.formConf.get('medals') as FormArray;
    let item = this.medalsList.find(({ id }) => id == e.target.value)
    if (e.target.checked) {
      medals.push(new FormControl(e.target.value));
      item && (item.isChecked = true)
    } else {
      const index = medals.controls.findIndex(x => x.value === e.target.value);
      item && (item.isChecked = false)
      medals.removeAt(index);
    }
    this.data.changeSelectedMedals(this.medalsList)
    // console.log(this.medalsList)
  }


  onYearSliderChange(e) {
    this.data.changeYearRange(this.yearRange)
    // console.log(e)
  }

  submit() {
    console.log(this.formConf.value);
  }

}
