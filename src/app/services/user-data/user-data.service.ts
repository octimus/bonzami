import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { ApiKinuService } from '../api-kinu/api-kinu.service';
import { from, Observable } from 'rxjs';
import { Device } from '@ionic-native/device/ngx';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  
  userId: any;
  userProfile: any;
  private access_token: string;
  chatUser: {id:string; name:string; avatar:string};
  _favorites: string[] = [];
  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_SHOW_TUT = 'hasSeenShowTut';
  HAS_SEEN_COM_TUT = 'hasSeenShowTut';
  HAS_SEEN_ADD_TUT = 'hasSeenShowTut';
  HAS_SEEN_MYPROD_TUT = 'hasSeenMyprodTut';
  HAS_SEEN_SETTINGS_TUT = 'hasSeenSettingsTut';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
  address_serveur:string = "";
  api_url: string = environment.apiUrl;;

  public loader: Loader;
  public step:any = 0;
  loading: any;
  CLIENT_ID: string;
  CLIENT_SECRET: string;

  constructor(
    public storage: Storage, public loadingCtrl:LoadingController,
    public alertCtrl:AlertController, 
    private httpClient: HttpClient, 
    private http: HTTP, private apiKinu: ApiKinuService, 
    private alertController: AlertController, private navCtrl: NavController, private device: Device)
  {  
    this.storage.get("access_token").then((data) => {
      this.access_token = data;
    })
    this.getClientId();
    this.loader = new Loader(new LoadingController);

    // events.subscribe('user:login', () => {
    // });

    this.chatUser = {id:"a", name:'st', avatar:'sh'};

    this.userProfile = {username:""}
    try {
      this.getUsername().then((donne)=>{
        this.chatUser.name = donne;
      })
      this.getPhoto().then((donne)=>{
        this.chatUser.avatar = donne;
      })
      this.getId().then((donne)=>{
        this.userId = donne;
        this.chatUser.id = donne;
      })
    } catch (error) {
      alert(error)
    }

   
  }

  hasFavorite(sessionName: string): boolean {
    return (this._favorites.indexOf(sessionName) > -1);
  };
  
  public verifyResetCode(login, code)
  {
    this.loader.presentLoading();
  }
  public sendResetCode(login)
  {
    this.loader.presentLoading();
  }
  
  createClient()
  {
    let params = {
      "redirect-uri":this.api_url, 
      "grant-type":"password",
      "identifiant": this.device.uuid
    };
    let method = "/createClient";
    let entetes = {
      "Content-Type": "application/json; charset=utf-8",
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
    };
    this.apiKinu.postData(method, params, entetes)
    .subscribe((data)=>{
      if(data.data["Erreur"]){
        this.presentAlert("Erreur", "", data.data["Erreur"]);
      }
      try
      {
        let response = data.data ? data.data : data;
        console.log({client_id_created: response});
        let donnees = JSON.parse(response);
        this.storage.set("client_id", donnees.client_id)
        this.CLIENT_ID = donnees.client_id
        this.storage.set("client_secret", donnees.client_secret);
        this.CLIENT_SECRET = donnees.client_secret
      }catch(err){
        this.presentAlert("Problème", "",JSON.stringify(err));
        this.presentAlert("data", "", data.data);
      }
    }, (error)=>{
      this.presentAlert('Problème de connexion', '', "");
      // this.createClient()
    });
  }
  login(userInfo):  any {

    // this.createClient();
    // return;

    this.storage.get('client_id').then((data)=>{
      this.storage.get('client_secret').then((s)=>{
        this.loader.presentLoading();
        let method = "/oauth/v2/token";
        let superClass = this;
        let body = {
          'grant_type': 'password',
          username: userInfo.username,
          'password': userInfo.password,
          client_id: data,
          client_secret: s
        };
        
        this.apiKinu.postData(method, body, {}).subscribe((datas)=>{
          this.loader.dismissLoading();
          let data = JSON.parse(datas.data);
    
          superClass.storage.set(superClass.HAS_LOGGED_IN, true);
          superClass.storage.set('access_token', data["access_token"]).catch((err)=>{
            alert(JSON.stringify(err));
          });
          this.access_token = data["access_token"]
          superClass.storage.set('expires_in', data["expires_in"]);
          superClass.storage.set('token_type', data["token_type"]);
          superClass.storage.set('refresh_token', data["refresh_token"]);
          superClass.storage.set('scope', data["scope"]);
    
          this.apiKinu.getEntetes();
          this.navCtrl.navigateRoot('')
    
          // superClass.events.publish('user:login');
        }, (error)=>{
          this.loader.dismissLoading();
    
          try {
            alert(JSON.stringify(error))
            let errorData = JSON.parse(error.error);
            this.presentAlert("Problème d'authentification", "", errorData.error_description);
          } catch (error) {
            alert(error);
          }
        });
      })
    })
  };

  getInfosLogged(role="entreprise")
  {
    if(role=="entreprise")
      return this.storage.get('infosEntreprise');
    else
      return this.storage.get('infosLogged');
  }

  getInfosCompte()
  {
    
    //cet fonction va nous permettre de recuperer les informations du compte connecté.
    let method = "/api/user/logged";

    return from(this.http.get(this.api_url+method, {}, {'authorization':'Bearer '+this.access_token,}));
  }
  getLogged(role="entreprise")
  {
    
    //cet fonction va nous permettre de recuperer les informations du compte connecté.
    let method;
    if(role == "entreprise")
      method = "/api/company/logged";
    else
      method = "/api/candidat/logged";

    return from(this.http.get(this.api_url+method, {}, {'authorization':'Bearer '+this.access_token,}));
  }
  signup(userInfo:any): Observable<any> {

    let user;
    let error = "";
    let method = '';
    if(userInfo.typeCompte == "particulier")
     method = '/createUserCandidat';
    else
      method = '/createUserEntreprise';

    let data = {
      email: userInfo.email,
      username: userInfo.username,
      plainPassword: ({
        first: userInfo.password,
        second: userInfo.confirm,
      })
    }
    
    this.loader.presentLoading();

    let req = this.apiKinu.postData(method, data, {})
    req.subscribe((data)=>{
      
      console.log(data.data)
      let data_user = data.data
      user = JSON.parse(data_user);

      if(user.id)
      {
        this.storage.set(this.HAS_LOGGED_IN, 1).then((err)=>{console.log(err)}, (err)=>{console.error(err)});
        this.storage.set('id', user.id);
        this.storage.set('salt', user.salt);
        this.storage.set('email', user.email);
        this.storage.set('username', user.username);
        this.storage.set('password', user.password);
        this.login({username:user.username, password:userInfo.password});
      }
      else
      {
        let s = unescape(encodeURIComponent(user.error))

        s = decodeURIComponent(escape(s));
        this.presentAlert("Erreur", "", s);
      }
      this.loader.dismissLoading();
    }, (err) =>{
      error = (JSON.stringify(err));
      return new Promise((resolve, reject)=>{
        reject(error);
      })
      this.loader.dismissLoading()
    });

    return req;
  //   this.http.post(this.api_url+method, {
  //     email:userInfo.email,
  //     username: userInfo.username,
  //     plainPassword: {
  //       first: userInfo.password,
  //       second: userInfo.confirm,
  //     }
  //   }, {}).then((data) => {
  //     alert(data.data);
  //   }, (err) =>{
  //     alert(JSON.stringify(err))
  //   })
  };

  async logout(): Promise<any> {
    this.loader.presentLoading();
    let superClass = this;

    this.storage.remove(this.HAS_LOGGED_IN).then(()=>{
      superClass.loader.dismissLoading();
    });

    this.storage.remove('username');
    this.storage.remove('access_token');
    this.storage.remove('refresh_token');
    this.storage.remove('expires_in');
    this.storage.remove('scope');
    this.storage.remove('token_type');
    this.storage.remove('telephone');             
    this.storage.remove('user_id');         
    this.storage.remove('email');         
    this.storage.remove('ville');   
    // this.events.publish('user:logout');
    let promesse = await this.storage.remove('userInfo');
    return promesse;
  };
  async alerter(message, titre = "") {
    const alert = await this.alertCtrl.create({
      header: titre,
      subHeader: message,
      buttons: ['Fermer']
    });
    alert.present();
  }
  setPhoto(username: string): void {
    this.storage.set('photo', username);
  };
  
  setUsername(username: string): void {
    this.loader.presentLoading();
  };
  setEmail(username: string): void {
  };
  setTelephone(telephone: string): void {
    this.loader.presentLoading();
    
  };
  setDomicile(username: string): void {
    this.loader.presentLoading();
  };
  setPasswordWithResetCode(login:any, code: string, passwordA:string, passwordB:string): Promise<any> {
    if(passwordB=="" || passwordA=="")
    {
      this.alerter("Veuillez remplire les 2 champs SVP.")
      return new Promise((data)=>{
        return data;
      });
    }
    else
    {
      this.loader.presentLoading();

      if(passwordA != passwordB)
      {
        this.alerter("Les 2 mots de passes saisies ne sont pas identiques.")
        return new Promise(()=>{
          return {status:"not ok"};
        });
      }
    }
  };
  setPassword(username: string, passwordA:string): void {
    if(username=="" || passwordA=="")
    {
      this.alerter("Veuillez remplire les 2 champs SVP.")
    }
    else
    {
      this.loader.presentLoading();
      
    }
  };
  
  getId(): Promise<string> {
    return this.storage.get('user_id').then((value) => {
      return value;
    });
  };
  getType(): Promise<string> {
    return this.storage.get('type').then((value) => {
      return value;
    });
  };
  getToken(): Promise<string> {
    return this.storage.get('access_token').then((value) => {
      return value;
    }, (error) =>{
      console.log({erreur_json: error})
    });
  };
  getEmail(): Promise<string> {
    return this.storage.get('email').then((value) => {
      return value;
    });
  };
  getDomicile(): Promise<string> {
    return this.storage.get('domicile').then((value) => {
      return value;
    });
  };
  getUsername()
  {
    return this.storage.get('username').then((value) => {
      return value;
    });
  }
  getAccountType()
  {
    return this.storage.get('account_type').then((value) => {
      let type = value == "ROLE_ENTREPRISE" ? "entreprise" : "candidat";
      return type;
    });
    
  }
  getPhoto()
  {
    return this.storage.get('photo').then((value) => {
      return value;
    });
  }
  getClientId()
  {
    this.storage.get('client_id').then((data) => {
      if(data)
      {  
        this.CLIENT_ID = data;
        this.storage.get('client_secret').then(s=>{
          this.CLIENT_SECRET = s;
        })
      }
      else
        this.createClient();
    }, (err) => {
      console.log(err)
      this.createClient();
    })
  }
  getCompanyId(): Promise<any> {
    return this.storage.get('company_id').then((data) => {
      return data;
    }, (err) => {
      return err;
    })
  }
  hasLoggedIn(): Promise<boolean> {
    return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
      return value === true;
    });

  };


  async presentAlert(title, subtitle, message, buttons: any[] = ['OK']) {
    
    title = typeof(title)=="string" ? title : JSON.stringify(title);
    subtitle = typeof(subtitle)=="string" ? subtitle : JSON.stringify(subtitle);
    message = typeof(message)=="string" ? message : JSON.stringify(message);

    const alert = await this.alertController.create({
      header: title,
      subHeader: subtitle,
      message: message,
      buttons: buttons
    });

    await alert.present();
  }
}

export class Loader
{
  constructor(private loadingController: LoadingController){
  }
  
  private loading;

  public async presentLoading() {
    this.loading = await this.loadingController.create({
      spinner: 'crescent',
      message: 'Veuillez patientez...',
      translucent: true,
      duration:5000,
      cssClass: 'custom-class custom-loading',
      backdropDismiss: true
    });
    await this.loading.present();

    const { role, data } = await this.loading.onDidDismiss();
    console.log('Loading dismissed with role:', role);
  }

  public async dismissLoading()
  {
    if(this.loading)
      this.loading.dismiss();
  }
}