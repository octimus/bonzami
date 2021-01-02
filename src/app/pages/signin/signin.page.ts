import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserDataService } from 'src/app/services/user-data/user-data.service';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { IonRouterOutlet, LoadingController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiKinuService } from 'src/app/services/api-kinu/api-kinu.service';
import { Plugins } from '@capacitor/core';
const { App } = Plugins;

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

  signinForm: FormGroup;
  api_url: string = "";
  loading: HTMLIonLoadingElement;


  constructor(private formBuilder: FormBuilder, 
    private userData: UserDataService, 
    private httpClient: HttpClient, 
    private http: HTTP, private loadingController: LoadingController, 
    private router: Router, private apiKinu: ApiKinuService) {
      // this.events.subscribe('user:login', () => {
      //   this.router.navigate(['/']);
      // });
    }

  ngOnInit() {
    this.signinForm = this.formBuilder.group({
      username:'',
      password:''
    });
    this.api_url = this.apiKinu.api_url;
  }

  onSubmitSignin()
  {
    this.userData.login(this.signinForm.value);
  }
}
