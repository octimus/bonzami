import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
import { UserDataService } from '../services/user-data/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private navCtrl:NavController, private userData: UserDataService){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userData.hasLoggedIn().then((data)=>{
      console.log(data)
      if(!data)
        this.navCtrl.navigateRoot(['/signin'])
        
      return data;
    }, (err)=>{
      console.error(err);
      return false;
    })
  }
  
}