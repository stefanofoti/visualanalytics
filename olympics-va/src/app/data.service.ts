import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isOlympicsDataReady, requiredYearRange, Team, Teams } from '../data/data'

@Injectable()
export class DataService {

  private messageSource = new BehaviorSubject(Teams);
  currentMessage = this.messageSource.asObservable();

  private olympicsReadinessSource = new BehaviorSubject(isOlympicsDataReady);
  olympycsReadinessMessage = this.olympicsReadinessSource.asObservable();

  private yearRangeSource = new BehaviorSubject(requiredYearRange);
  changedYearRangeMessage = this.yearRangeSource.asObservable();

  constructor() { }

  changeMessage(message: Team[]) {
    this.messageSource.next(message)
  }

  onOlympicsDataReady(message: Boolean) {
    this.olympicsReadinessSource.next(message)
  }

  changeYearRange(message: number[]) {
    this.yearRangeSource.next(message)
  }

}
