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

  processData(json: any, scanTxt:any, verify: any) {
    let cssClass = '';
    let message: string = '';
    const validHeader: string = verify === "verify" ? "Ticket Valide" : "Véhicule Valide";

    if(json["status"] == "error"){
      this.alertCtrl.create({header:"Erreur", message:json["message"], buttons:["OK"]}).then(a=>a.present());
    }
    else{
      //manipulons la reponse

      if(json["status"] == "OK"){
        if(json["autorise"] == "OUI"){
          if(verify != "verifyflotte"){
            cssClass = "alert-success";
          }else
            cssClass = "alert-info";
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
      let code = scanTxt.split("/")[0];
      this.alertCtrl.create(
        {
          cssClass: cssClass,
          header: json["status"] == "ALERT" ? "ALERT" : (json["autorise"]=='OUI' ? `${validHeader}` : ""), 
          subHeader: code,
          message: "<h2>"+message+"</h2>",
          inputs:verify == "verifyflotte" && json["status"] == "OK" && json["autorise"] == "OUI"? [{
            name:"quantite",
            placeholder: "Quantité demandée",
            type:"number",
            max: json["quantite"],
            min: 1,
          }] : [],
          buttons: json["status"] == "OK" && json["autorise"] == "OUI" ? 
          [
            {
              text:"Confirmer",
              handler:(p)=>this.confirmer(json["check_id"], p, ()=>{this.processData(json, scanTxt, verify)}),
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
  }

  scan(verify = "verify"){
    let l;
    // this.processData({'status':'OK','autorise':'OUI','produit':"PETROLE", 		'quantite':40, 'check_id':1, 'matricule':'780AB73'}, "150MB73/1", verify);
    // return;
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
      
      this.apiKinu.getData(`/api/ticket/${verify}/${data.text}`, {}).subscribe((result)=>{
        l.dismiss();
        let json = JSON.parse(result.data);

        this.processData(json, data.text, verify);
      }, (err)=>{
        l.dismiss();
        alert(JSON.stringify(err));
      })
    }).catch((err)=>{
      l.dismiss();
      alert(JSON.stringify(err));

    })
  }
  confirmer(check_id:string, p, reopen){
    if(!p.quantite || p.quantite < 1)
    {  
      alert("Quantité incorrecte");
      reopen();
      return;
    }

    let url: string = typeof(p) == "undefined" ? "/api/ticket/check/"+check_id : `/api/ticket/checkflotte/${check_id}/${p.quantite}`
    this.loader.presentLoading();
    this.apiKinu.getData(url, {}).subscribe(async (result)=>{
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
