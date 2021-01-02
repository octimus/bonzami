import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AlertController, IonRouterOutlet, LoadingController, NavController, Platform } from '@ionic/angular';
import { ApiKinuService } from 'src/app/services/api-kinu/api-kinu.service';
import { Loader, UserDataService } from 'src/app/services/user-data/user-data.service';
const { App } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  private loader: Loader;
  constructor(private bScanner: BarcodeScanner, private apiKinu: ApiKinuService, 
    private alertCtrl: AlertController, 
    private loadingController: LoadingController, private userData: UserDataService, private navCtrl: NavController) { 
      this.apiKinu.getEntetes();
      this.loader = new Loader(new LoadingController);
    }

  ngOnInit() {
  }

  scan(){
    let l;
    let cssClass = '';
    let message: string = '';

    this.loadingController.create({message:"Chargement..."}).then((ll)=>{
      l = ll;
    });
    this.bScanner.scan({resultDisplayDuration:0}).then((data)=>{
      l.present();
      if(data.text == "")
      {  
        l.dismiss();
        return;
      }
      
      this.apiKinu.getData(`/api/ticket/verify/${data.text}`, {}).subscribe((result)=>{
        l.dismiss();
        let json = JSON.parse(result.data);

        if(json["status"] == "error"){
          this.alertCtrl.create({header:"Erreur", message:json["message"], buttons:["OK"]}).then(a=>a.present());
        }
        else{
          //manipulons la reponse

          if(json["status"] == "OK"){
            if(json["autorise"] == "OUI"){
              cssClass = "alert-success";
              message = json["produit"]+" : "+json["quantite"]+" L.";
            }
            else
            {
              cssClass = "alert-dark";
              message = json["message"];
            }
          }
          else if(json["status"] == "KO"){
            cssClass = "alert-danger";
            message = json["message"];
          }
          else if(json["status"] == "ALERT"){
            cssClass = "alert-warning";
            message = json["message"];
          }else{
            message = json["message"];
          }
          let code = data.text.split("/")[0];
          this.alertCtrl.create(
            {
              cssClass: cssClass,
              header: json["status"] == "ALERT" ? "ALERT" : (json["autorise"]=='OUI' ? `Ticket Valide` : ""), 
              subHeader: code,
              message: message,
              buttons: json["status"] == "OK" && json["autorise"] == "OUI" ? 
              [
                {
                  text:"Confirmer", 
                  handler:()=>this.confirmer(json["check_id"]),
                  cssClass:"confirm-button",
                  
                }, 
                {
                  text:"Fermer", 
                  cssClass:"close-button"
                }
              ] :  ["OK"]
            }).then((al)=>{
              al.present();
            });
        }
      }, (err)=>{
        l.dismiss();
        alert(JSON.stringify(err));
      })
    }).catch((err)=>{
      l.dismiss();
      alert(JSON.stringify(err));
    })
  }
  confirmer(check_id:string){
    this.loader.presentLoading();
    this.apiKinu.getData("/api/ticket/check/"+check_id, {}).subscribe(async (result)=>{
      this.loader.dismissLoading();
      let json = JSON.parse(result.data);
      let al: HTMLIonAlertElement = await this.alertCtrl.create(
        {
          cssClass: json["status"] == "CONFIRM" ? "alert-success" : (json["status"] == "ALERT" ? "alert-warning" : "alert-danger"),
          header: json["message"], subHeader: "", buttons: ["Fermer"]
        });
      al.present();
    }, (error)=>{
      this.loader.dismissLoading();
      alert(JSON.stringify(error));
    })
  }

  logout(){
    this.userData.logout().then(d=>{
      this.navCtrl.navigateRoot('signin');
    })
  }
}
