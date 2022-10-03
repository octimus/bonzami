import { Component, OnInit } from '@angular/core';
import { ConsomationResponse } from 'src/app/models/consomation.model';
import { ApiKinuService } from 'src/app/services/api-kinu/api-kinu.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  public consomations: ConsomationResponse;
  public loading: boolean = false;
  public date: any = new Date().toISOString();

  constructor(private api: ApiKinuService) { }
  refresh(p: any){
    this.ngOnInit();
  }
  ngOnInit() {
    this.consomations = null;
    this.loading = true;
    this.api.getData(`/api/ticket/history/${this.date.split('T')[0]}`, {})
    .pipe(finalize(()=>{this.loading = false}), take(1))
    .subscribe((data) => {
        if(data.data != ''){
          this.consomations = ConsomationResponse.fromMap(typeof(data.data) == 'string' ? JSON.parse(data.data) : data.data);
        }
        console.log(data);
    });
  }
}
