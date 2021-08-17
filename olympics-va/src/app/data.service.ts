import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Team, Teams } from '../data/data'

@Injectable()
export class DataService {

  private messageSource = new BehaviorSubject(Teams);
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: Team[]) {
    this.messageSource.next(message)
  }

}
