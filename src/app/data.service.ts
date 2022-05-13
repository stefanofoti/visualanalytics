import { Injectable } from '@angular/core';
import { boolean, string } from 'mathjs';
import { BehaviorSubject } from 'rxjs';
import { Countries, Populations, Country,isEventsPerSportDataReady, CountryPopulation, isOlympicsDataReady, Medal, Medals, requiredYearRange, Sport, Sports, Team, Teams, MouseSelection, MouseSel, TraditionSel, TraditionSelection, PCAEntry, PCAData } from '../data/data'

@Injectable()
export class DataService {

  private messageSource = new BehaviorSubject(Teams);
  currentMessage = this.messageSource.asObservable();

  private selectedMedalsSource = new BehaviorSubject(Medals);
  selectedMedalsMessage = this.selectedMedalsSource.asObservable();

  private olympicsReadinessSource = new BehaviorSubject(isOlympicsDataReady);
  olympycsReadinessMessage = this.olympicsReadinessSource.asObservable();

  private eventsPerSportDataSource = new BehaviorSubject(isEventsPerSportDataReady);
  eventsPerSportDataMessage = this.eventsPerSportDataSource

  private sportsReadinessSource = new BehaviorSubject(Sports);
  sportsReadinessMessage = this.sportsReadinessSource.asObservable();

  private yearRangeSource = new BehaviorSubject(requiredYearRange);
  changedYearRangeMessage = this.yearRangeSource.asObservable();

  private investmentSource = new BehaviorSubject(undefined);
  changedInvestmentMessage = this.investmentSource

  private selectedSportSource = new BehaviorSubject(Sports);
  selectedSportsMessage = this.selectedSportSource.asObservable();

  private selectedCountrySource = new BehaviorSubject(Countries);
  selectedCountryMessage = this.selectedCountrySource.asObservable();

  private countryReadinessSource = new BehaviorSubject(Countries);
  countryReadinessMessage = this.countryReadinessSource.asObservable();

  private populationsReadinessSource = new BehaviorSubject(Populations);
  populationsReadinessMessage = this.populationsReadinessSource.asObservable();

  private updateReadinessSource = new BehaviorSubject([]);
  updateReadinessMessage = this.updateReadinessSource.asObservable();

  private analyticsReadinessSource = new BehaviorSubject([]);
  analyticsReadinessMessage = this.analyticsReadinessSource.asObservable();

  private mouseSelectionSource = new BehaviorSubject(MouseSel)
  updateMouseSelectionMessage = this.mouseSelectionSource.asObservable()

  private traditionSelectionSource = new BehaviorSubject(TraditionSel)
  traditionSelectionMessage = this.traditionSelectionSource.asObservable()

  private pcaDataReadySource = new BehaviorSubject(undefined)
  pcaDataReadyMessage = this.pcaDataReadySource.asObservable()

  private avgGdpPopSource = new BehaviorSubject({})
  avgGdpPopMessage = this.avgGdpPopSource.asObservable()

  private yearlyDataSource = new BehaviorSubject(undefined)
  yearlyDataMessage = this.yearlyDataSource.asObservable()

  private scatter3DSource = new BehaviorSubject(true)
  scatter3DMessage = this.scatter3DSource.asObservable()

  private countryFromMapSource = new BehaviorSubject([])
  countryFromMapMessage = this.countryFromMapSource.asObservable()

  private mostSimilarCountrySource = new BehaviorSubject(string)
  mostSimilarCountryMessage = this.mostSimilarCountrySource.asObservable()

  private areaClickSource = new BehaviorSubject([])
  areaClickMessage = this.areaClickSource.asObservable()


  constructor() { }

  changeMessage(message: Team[]) {
    this.messageSource.next(message)
  }

  onOlympicsDataReady(message: Boolean) {
    this.olympicsReadinessSource.next(message)
  }

  onEventsPerSportDataReady(message: any){
    this.eventsPerSportDataSource.next(message)    
  }

  onSportsDataReady(message: Sport[]) {
    this.sportsReadinessSource.next(message)
  }

  onCountriesDataReady(message: Country[]) {
    this.countryReadinessSource.next(message)
  }

  onPopulationsDataReady(message: CountryPopulation[]) {
    this.populationsReadinessSource.next(message)
  }

  changeYearRange(message: number[]) {
    this.yearRangeSource.next(message)
  }

  changeInvestment(message: number) {
    this.investmentSource.next(message)
  }

  changeSelectedMedals(message: Medal[]) {
    this.selectedMedalsSource.next(message)
  }

  changeSelectedSports(message: Sport[]) {
    this.selectedSportSource.next(message)
  }

  changeSelectedCountries(message: Country[]) {
    this.selectedCountrySource.next(message)
  }

  updateNewData(message: any) {
    this.updateReadinessSource.next(message)
  }

  updateAnalyticsData(message: any) {
    this.analyticsReadinessSource.next(message)
  }

  updateMouseSelection(message: MouseSelection) {
    this.mouseSelectionSource.next(message)
  }

  updateTraditionSelection(message: TraditionSelection) {
    this.traditionSelectionSource.next(message)
  }

  pcaDataReady(message: PCAEntry[]) {
    this.pcaDataReadySource.next(message)
  }

  avgGdpPopReady(message: any) {
    this.avgGdpPopSource.next(message)
  }

  onYearlyDataReady(message: any){
    this.yearlyDataSource.next(message)
  }

  onChangeScatterType(message: boolean){
    this.scatter3DSource.next(message)
  }

  CountryFromMapReady(message: any){
    this.countryFromMapSource.next(message)
  }

  MostSimilarCountryReady(message: any){
    this.mostSimilarCountrySource.next(message)
  }

  AreaClickReady(message: any){
    this.areaClickSource.next(message)
  }

}
