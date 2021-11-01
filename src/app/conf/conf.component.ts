import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { DataService } from "../data.service";
import { Observable, Subscription } from 'rxjs';
import { Country, MainComputationResult, Medal, PCAEntry, PcaQuery, PreCheckedSports, PreCheckedSports2, Query, requiredYearRange, ScatterConf, Sport, Team, Teams } from 'src/data/data';
import { Options } from '@angular-slider/ngx-slider';
import { of, pipe } from 'rxjs';
import { map, filter, tap, startWith } from 'rxjs/operators'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipInput } from '@angular/material/chips';
import { LoaderService } from '../loader.service';
import { BooleanInput } from 'ngx-boolean-input';
import { PcaService } from '../pca.service';
import * as ld from "lodash";


@Component({
  selector: 'app-conf',
  templateUrl: './conf.component.html',
  styleUrls: ['./conf.component.css', './slider.conf.component.scss']
})

export class ConfComponent implements OnInit {

  COMPONENT_HEIGHT = "27vh"
  COMPONENT_HEIGHT_TRAD = "33vh"

  componentHeight = this.COMPONENT_HEIGHT

  isEverySportSelected = false
  isEveryCountrySelected = false

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
  fullSportsList: Sport[]
  countryList: Country[]
  traditionCountry: string

  topNationsAmount: number
  traditionCountriesNumber: number
  traditionPastWeight: number
  @Input() @BooleanInput()
  isMedalsByPop: any

  isScatter: boolean = ScatterConf.isScatter
  //@Input() @BooleanInput()
  isNormalize: boolean = false //any

  isMaleChecked: boolean = true
  isFemaleChecked: boolean = true


  isTradition: boolean = false
  isWinter: boolean = true
  isSummer: boolean = true

  is3D: boolean = true

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

  actionsEnabled: boolean = false

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
      this.fullSportsList = message
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
      if (this.isOlympicsDataReady) {
        this.traditionCountry = message.noc
        this.isTradition = message.currentlySelected
        // disattivare input paesi
        // ripristinare la selezione
        message.currentlySelected && (this.componentHeight = this.COMPONENT_HEIGHT_TRAD)
        !message.currentlySelected && (this.componentHeight = this.COMPONENT_HEIGHT)

        message.currentlySelected && (this.selectedCountry = [])
        message.currentlySelected && this.countryControl.disable()
        !message.currentlySelected && this.countryControl.enable()
        this.updateData()

      }
    })
    data.pcaDataReadyMessage.subscribe(message => {
      console.log("pca data: ", message)
      message && (this.actionsEnabled = true)

    })


  }


  updateSeason(event) {
    this.sportsList = []
    this.isWinter && this.isSummer && (this.sportsList = this.fullSportsList)
    this.isSummer && !this.isWinter && (this.fullSportsList.forEach(s => s.season === "winter" && (s.isChecked = false)))
    this.isSummer && !this.isWinter && (this.sportsList = this.fullSportsList.filter(s => s.season === "summer"))
    !this.isSummer && this.isWinter && (this.fullSportsList.forEach(s => s.season === "summer" && (s.isChecked = false)))
    !this.isSummer && this.isWinter && (this.sportsList = this.fullSportsList.filter(s => s.season === "winter"))
    this.initSportsChecklist()
  }

  selectAllSports() {
    this.selectedSports.splice(0,this.selectedSports.length)
    if(!this.isEverySportSelected) {
      this.sportsList.forEach(s => { s.isChecked = true; this.selectedSports.push(s) })
      return
    }
    this.sportsList.forEach(s => { s.isChecked = false })
  }

  selectAllCountries() {
    this.selectedCountry.splice(0,this.selectedCountry.length)
    if(!this.isEveryCountrySelected) {
      this.countryList.forEach(c => { c.isChecked = true; this.selectedCountry.push(c) })
      return
    }
    this.countryList.forEach(c => { c.isChecked = false })
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
    this.selectedSports = []
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
    items.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    items.sort((a, b) => (a.group > b.group) ? 1 : ((b.group > a.group) ? -1 : 0))
    items.sort((a, b) => (!a.isChecked) ? 1 : ((!b.isChecked) ? -1 : 0))
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
    items.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    items.sort((a, b) => (!a.isChecked) ? 1 : ((!b.isChecked) ? -1 : 0))

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
    this.actionsEnabled = false
    console.log("conf: Invoke updateData()")
    let selMedals: string[] = []
    let medalsList = ld.cloneDeep(this.medalsList)
    medalsList.forEach(m => { m.isChecked && selMedals.push(m.id) })
    medalsList.forEach(m => m.weight = m.weight ? Number(m.weight) : 1)
    let selSports: string[] = this.selectedSports.map(s => s.name)
    if (selSports.length === 0) {
      selSports = this.sportsList.map(s => s.name)
    }
    let selCountries: string[] = this.selectedCountry.length > 0 ? this.selectedCountry.map(s => s.id) : []
    console.log("conf. is tradition: ", this.isTradition)
    console.log("conf. medalsList:", medalsList)
    let q: PcaQuery = {
      start: this.yearRange[0],
      end: this.yearRange[1],
      medals: medalsList,
      selectedSports: selSports,
      selectedNocs: selCountries,
      isNormalize: this.isNormalize,
      isTradition: this.isTradition,
      isGdp: this.isMedalsByGdp,
      isPop: this.isMedalsByPop,
      isMale: this.isMaleChecked,
      isFemale: this.isFemaleChecked,
      is3D: this.is3D
    }
    let tradCount = this.traditionCountriesNumber ? this.traditionCountriesNumber : 5
    let tradWeight = this.traditionPastWeight ? this.traditionPastWeight : 100
    let topAmount = this.topNationsAmount ? this.topNationsAmount : 40
    this.loaderService.computeMedalsByNationInRange(this.yearRange[0], this.yearRange[1], medalsList, selSports, this.isMedalsByPop, this.isMedalsByGdp, this.isNormalize, this.isTradition, selCountries, this.isMaleChecked, this.isFemaleChecked, this.isScatter, topAmount, tradCount, tradWeight).then(res => {
      if(!res) {
        alert("No data to show with the selected filters.")
        this.actionsEnabled = true
        return
      }
      let r = res as MainComputationResult
      let stats = r.stats
      let max = r.max
      let maxSingleSport = r.maxSingleSport
      this.data.updateNewData([stats, max, maxSingleSport, r.sportsList, selMedals, this.yearRange, selCountries])
      console.log("conf: updateData() result: ", stats)

      if (this.isTradition) {
        q.selectedNocs = ld.cloneDeep(Object.keys(stats))
      }
      this.pcaService.computePca(q, this.loaderService.csvLines)


    })

    // if (!this.isTradition) {
    //   this.pcaService.computePca(q, this.loaderService.csvLines).then(res => {
    //     let x: PCAEntry[] = res
    //     console.log("plotting pca: sending readiness...", x)
    //     this.data.pcaDataReady(x)
    //   })
    // }

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

  onMedalsCheckboxChange(medal) {
    /*const medals: FormArray = this.formConf.get('medals') as FormArray;
    let item = this.medalsList.find(({ id }) => id == e.target.value)
    if (e.target.checked) {
      medals.push(new FormControl(e.target.value));
      item && (item.isChecked = true)
    } else {
      const index = medals.controls.findIndex(x => x.value === e.target.value);
      item && (item.isChecked = false)
      medals.removeAt(index);
    }*/
    // this.data.changeSelectedMedals(this.medalsList)
    // this.updateData()
  }


  onYearSliderChange(e) {
    // this.updateData()
    // this.data.changeYearRange(this.yearRange)
    // console.log(e)
  }

  submit() {
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
    if (!medal.weight) {
      return !isNaN(event.key)
    }
    return !isNaN(medal.weight + event.key)
  }


  numberOnlyInteger(event, nrStr, min, max): boolean {
    let str = event.key
    nrStr && (str = nrStr + str)
    let n = Number(str)
    return !isNaN(n) && n % 1 == 0 && n <= max && n > min
  }


  swicthScatter() {
    ScatterConf.isScatter = this.isScatter
    window.dispatchEvent(new Event('resize'));
  }

}
