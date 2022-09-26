import { Component, Input, OnInit } from '@angular/core';
import { ConsomationModel } from '../models/consomation.model';

@Component({
  selector: 'app-history-card',
  templateUrl: './history-card.component.html',
  styleUrls: ['./history-card.component.scss'],
})
export class HistoryCardComponent implements OnInit {
  @Input('consomation') consomation: ConsomationModel;
  constructor() { 
  }

  ngOnInit() {
    console.log({consomation: this.consomation});
  }

}
