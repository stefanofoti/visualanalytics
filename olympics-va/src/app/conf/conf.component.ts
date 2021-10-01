import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { DataService } from "../data.service";
import { Observable, Subscription } from 'rxjs';
import { Country, MainComputationResult, Medal, PCAEntry, PcaQuery, PreCheckedSports, PreCheckedSports2, Query, requiredYearRange, Sport, Team, Teams } from 'src/data/data';
import { Options } from '@angular-slider/ngx-slider';
import { of, pipe } from 'rxjs';
import { map, filter, tap, startWith } from 'rxjs/operators'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipInput } from '@angular/material/chips';
import { LoaderService } from '../loader.service';
import { BooleanInput } from 'ngx-boolean-input';
import { PcaService } from '../pca.service';


@Component({
  selector: 'app-conf',
  templateUrl: './conf.component.html',
  styleUrls: ['./conf.component.css', './slider.conf.component.scss']
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
  traditionSelectionSubscription: Subscription

  sportsList: Sport[]
  countryList: Country[]
  traditionCountry: string

  @Input() @BooleanInput()
  isMedalsByPop: any

  //@Input() @BooleanInput()
  isNormalize: boolean = false //any

  isTradition: boolean = false
  
  @Input() @BooleanInput()
  isMedalsByGdp: any

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

  constructor(private formBuilder: FormBuilder, private data: DataService, private loaderService: LoaderService, private pcaService: PcaService) {
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
    this.traditionSelectionSubscription = this.data.traditionSelectionMessage.subscribe(message => {
      this.isOlympicsDataReady && (this.traditionCountry = message.noc)
      this.isOlympicsDataReady && (this.isTradition = message.currentlySelected)
      this.isOlympicsDataReady && this.updateData()
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
    // this.updateData()
  }

  updateData() {
    console.log("conf: Invoke updateData()")
    let selMedals: string[] = []
    this.medalsList.forEach(m => {m.isChecked && selMedals.push(m.id)})
    let selSports: string[] = this.selectedSports.map(s => s.name)
    let selCountries: string[] = this.selectedCountry.length>0 ? this.selectedCountry.map(s => s.id) : [] 
    this.medalsList.forEach (m => m.weight = Number(m.weight))
    console.log("conf. is tradition: ", this.isTradition)
    console.log("conf. medalsList:",this.medalsList)
    this.loaderService.computeMedalsByNationInRange(this.yearRange[0], this.yearRange[1], this.medalsList, selSports, this.isMedalsByPop, this.isMedalsByGdp, this.isNormalize, this.isTradition).then(res  => {
      let r = res as MainComputationResult
      let stats = r.stats
      let max = r.max
      let maxSingleSport = r.maxSingleSport
      this.data.updateNewData([stats, max, maxSingleSport, r.sportsList, selMedals, this.yearRange, selCountries])
      console.log("conf: updateData() result: ", stats)
    })


    let q: PcaQuery = {
      start: this.yearRange[0],
      end: this.yearRange[1],
      medals: this.medalsList,
      selectedSports: selSports,
      selectedNocs: selCountries,
      isNormalize: this.isNormalize
    }


    this.pcaService.computePca(q, this.loaderService.csvLines).then(res => {
      let x: PCAEntry[] = res
      console.log("plotting pca: sending readiness...", x)
      this.data.pcaDataReady(x)
    })

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
    // this.updateData()
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
    // this.updateData()
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
    // this.updateData()
    // console.log(this.medalsList)
  }


  onYearSliderChange(e) {
    // this.updateData()
    // this.data.changeYearRange(this.yearRange)
    // console.log(e)
  }

  submit() {
    console.log("update required");
    console.log(this.medalsList)
    this.updateData()
  }

  onSlideTogglePopChanged(event) {
    this.isMedalsByPop = event.checked
    this.isMedalsByGdp && this.isMedalsByPop && (this.isMedalsByGdp = false)
    // this.updateData()
  }

  onSlideToggleGdpChanged(event) {
    this.isMedalsByGdp = event.checked
    this.isMedalsByGdp && this.isMedalsByPop && (this.isMedalsByPop = false)
    // this.updateData()
  }

  numberOnly(event, medal): boolean {
    return !isNaN(medal.weight+event.key)
  }

}
