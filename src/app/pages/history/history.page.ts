import { Component, OnInit } from '@angular/core';
import { ConsomationResponse } from 'src/app/models/consomation.model';
import { ApiKinuService } from 'src/app/services/api-kinu/api-kinu.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  public consomations: ConsomationResponse;
  public loading: boolean = false;
  public date: any = new Date().toISOString().split('T')[0];

  constructor(private api: ApiKinuService) { }
  refresh(p: any){
    this.ngOnInit();
  }
  ngOnInit() {
    this.loading = true;
    this.api.getData(`/api/ticket/history/${this.date}`, {}).pipe(finalize(()=>{this.loading = false}))
    .subscribe((data) => {
      this.consomations = data;
    });
  }

}
