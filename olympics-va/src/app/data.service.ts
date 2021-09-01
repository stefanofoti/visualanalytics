import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Countries, Country, isOlympicsDataReady, Medal, Medals, requiredYearRange, Sport, Sports, Team, Teams } from '../data/data'

@Injectable()
export class DataService {

  private messageSource = new BehaviorSubject(Teams);
  currentMessage = this.messageSource.asObservable();

  private selectedMedalsSource = new BehaviorSubject(Medals);
  selectedMedalsMessage = this.selectedMedalsSource.asObservable();

  private olympicsReadinessSource = new BehaviorSubject(isOlympicsDataReady);
  olympycsReadinessMessage = this.olympicsReadinessSource.asObservable();

  private sportsReadinessSource = new BehaviorSubject(Sports);
  sportsReadinessMessage = this.sportsReadinessSource.asObservable();

  private yearRangeSource = new BehaviorSubject(requiredYearRange);
  changedYearRangeMessage = this.yearRangeSource.asObservable();

  private selectedSportSource = new BehaviorSubject(Sports);
  selectedSportsMessage = this.selectedSportSource.asObservable();

  private selectedCountrySource = new BehaviorSubject(Countries);
  selectedCountryMessage = this.selectedCountrySource.asObservable();

  private countryReadinessSource = new BehaviorSubject(Countries);
  countryReadinessMessage = this.countryReadinessSource.asObservable();

  private updateReadinessSource = new BehaviorSubject([]);
  updateReadinessMessage = this.updateReadinessSource.asObservable();

  constructor() { }

  changeMessage(message: Team[]) {
    this.messageSource.next(message)
  }

  onOlympicsDataReady(message: Boolean) {
    this.olympicsReadinessSource.next(message)
  }

  onSportsDataReady(message: Sport[]) {
    this.sportsReadinessSource.next(message)
  }

  onCountriesDataReady(message: Country[]) {
    this.countryReadinessSource.next(message)
  }

  changeYearRange(message: number[]) {
    this.yearRangeSource.next(message)
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


}
