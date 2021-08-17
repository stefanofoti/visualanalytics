import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { DataService } from "../data.service";
import { Subscription } from 'rxjs';
import { Team, Teams } from 'src/data/data';

@Component({
  selector: 'app-medal-conf',
  templateUrl: './medal-conf.component.html',
  styleUrls: ['./medal-conf.component.css']
})

export class MedalConfComponent implements OnInit {

  formTeams: FormGroup
  teamsList: Team[] = Teams
  subscription: Subscription;



  constructor(private formBuilder: FormBuilder, private data: DataService) {
    this.formTeams = this.formBuilder.group({
      teams: this.formBuilder.array([], [Validators.required])
    })
    this.subscription = this.data.currentMessage.subscribe(message => this.teamsList = message)

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
    
  submit(){
    console.log(this.formTeams.value);
  }

}
