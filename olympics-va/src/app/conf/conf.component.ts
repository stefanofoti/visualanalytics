import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { DataService } from "../data.service";
import { Observable, Subscription } from 'rxjs';
import { Country, Medal, PreCheckedSports, PreCheckedSports2, requiredYearRange, Sport, Team, Teams } from 'src/data/data';
import { Options } from '@angular-slider/ngx-slider';
import { of, pipe } from 'rxjs';
import { map, filter, tap, startWith } from 'rxjs/operators'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipInput } from '@angular/material/chips';
import { LoaderService } from '../loader.service';
import { BooleanInput } from 'ngx-boolean-input';


@Component({
  selector: 'app-conf',
  templateUrl: './conf.component.html',
  styleUrls: ['./conf.component.css']
})

export class ConfComponent implements OnInit {

  formConf: FormGroup
  teamsList: Team[] = Teams
  medalsList: Medal[]
  subscription: Subscription
  yearRangeSubscription: Subscription
  selectedMedalsSubscription: Subscription
  selectedSportsSubscription: Subscription
  sportsReadinessSubscription: Subscription
  countryReadinessSubscription: Subscription

  sportsList: Sport[]
  countryList: Country[]

  @Input() @BooleanInput()
  isMedalsByPop: any
  
  @Input() @BooleanInput()
  isMedalsByGnp: any

  isOlympicsDataReady: Boolean

  //---
  sportControl = new FormControl();
  countryControl = new FormControl();

  selectedSports: Sport[] = new Array<Sport>();
  selectedCountry: Country[] = new Array<Country>();
  filteredSports: Observable<Sport[]>;

  filteredCountries: Observable<Country[]>;
  lastFilter: string = '';
  lastCountryFilter: string = '';
  //----


  yearRange: number[]
  sliderOptions: Options = {
    floor: requiredYearRange[0],
    ceil: requiredYearRange[1]
  };

  constructor(private formBuilder: FormBuilder, private data: DataService, private loaderService: LoaderService) {
    this.formConf = this.formBuilder.group({
      teams: this.formBuilder.array([], [Validators.required]),
      medals: this.formBuilder.array([], [Validators.required])
    })
    this.subscription = this.data.currentMessage.subscribe(message => this.teamsList = message)
    this.yearRangeSubscription = this.data.changedYearRangeMessage.subscribe(message => this.yearRange = message)
    this.selectedMedalsSubscription = this.data.selectedMedalsMessage.subscribe(message => this.medalsList = message)
    this.data.olympycsReadinessMessage.subscribe(message => {
      this.isOlympicsDataReady = message
      this.isOlympicsDataReady && this.updateData()
    })
    this.sportsReadinessSubscription = this.data.sportsReadinessMessage.subscribe(message => {
      this.sportsList = message
      this.initSportsChecklist()
    })
    this.selectedSportsSubscription = this.data.selectedSportsMessage.subscribe(message => {
      this.selectedSports = message
    })
    this.countryReadinessSubscription = this.data.countryReadinessMessage.subscribe(message => {
      this.countryList = message
      this.initCountryChecklist()
    })

  }






  ngOnInit(): void {
  }

  initCountryChecklist(): void {
    this.countryList.forEach(c => { c.isChecked && this.selectedCountry.push(c) })
    this.filteredCountries = this.countryControl.valueChanges.pipe(
      startWith<string | Country[]>(''),
      map(value => typeof value === 'string' ? value : this.lastCountryFilter),
      map(filter => this.countryFilter(filter))
    )
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

  countryFilter(filter: string): Country[] {
    this.lastCountryFilter = filter;
    let items = this.countryList
    items.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    items.sort((a,b) => (!a.isChecked) ? 1 : ((!b.isChecked) ? -1 : 0))

    if (filter) {
      return items.filter(c => {
        return c.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0
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

  displayCountryFn(value: Country[]): string | undefined {
    let displayValue: string = "";
    if (Array.isArray(value) && this.isOlympicsDataReady) {
      value.forEach((country, index) => {
        if (index === 0) {
          displayValue = country.name;
        } else {
          displayValue += ', ' + country.name;
        }
      });
    } else {
      // PreCheckedSports.forEach((sport, index) => displayValue += (index > 0 ? ", " + sport : sport))
    }
    return displayValue;
  }

  optionClicked(event: Event, sport: Sport) {
    event.stopPropagation();
    this.toggleSelection(sport);
  }

  optionCountryClicked(event: Event, country: Country) {
    event.stopPropagation();
    this.toggleSelectionCountry(country);
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
    // this.data.changeSelectedSports(this.selectedSports)
    this.updateData()
  }

  updateData() {
    console.log("conf: Invoke updateData()")
    let selMedals: string[] = []
    this.medalsList.forEach(m => {m.isChecked && selMedals.push(m.id)})
    let selSports: string[] = this.selectedSports.map(s => s.name)
    let selCountries: string[] = this.selectedCountry.length>0 ? this.selectedCountry.map(s => s.id) : [] 
    let [stats, max, maxSingleSport] = this.loaderService.computeMedalsByNationInRange(this.yearRange[0], this.yearRange[1], selMedals, selSports, this.isMedalsByPop)
    this.data.updateNewData([stats, max, maxSingleSport, selSports, selMedals, this.yearRange, selCountries])
    console.log("conf: updateData() result")
    console.log(stats)
  }

  toggleSelectionCountry(country: Country) {
    country.isChecked = !country.isChecked;
    if (country.isChecked) {
      this.selectedCountry.push(country);
    } else {
      const i = this.selectedCountry.findIndex(value => value.name === country.name);
      this.selectedCountry.splice(i, 1);
    }
    console.log(this.selectedCountry)
    this.countryControl.setValue(this.selectedCountry);
    //this.data.changeSelectedCountries(this.selectedCountry)
    this.updateData()
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
    // this.data.changeMessage(this.teamsList)
    this.updateData()
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
    // this.data.changeSelectedMedals(this.medalsList)
    this.updateData()
    // console.log(this.medalsList)
  }


  onYearSliderChange(e) {
    this.updateData()
    // this.data.changeYearRange(this.yearRange)
    // console.log(e)
  }

  submit() {
    console.log(this.formConf.value);
  }

  onSlideTogglePopChanged(event) {
    this.isMedalsByPop = event.checked
    this.isMedalsByGnp && this.isMedalsByPop && (this.isMedalsByGnp = false)
    this.updateData()
  }

  onSlideToggleGnpChanged(event) {
    this.isMedalsByGnp = event.checked
    this.isMedalsByGnp && this.isMedalsByPop && (this.isMedalsByPop = false)
    this.updateData()
  }

}
