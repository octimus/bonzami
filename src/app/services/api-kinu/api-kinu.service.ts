import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiKinuService {
    
  api_url: string = environment.apiUrl;
  public native: boolean = true;
  private entete: {} = {};
  
  constructor(private http: HTTP, private httpClient: HttpClient, 
    private platform: Platform, private storage: Storage) { 
    this.http.setDataSerializer("json");
    
    this.getEntetes();
  }

  getEntetes(): void
  {
    this.storage.get("access_token").then((data) => {
      if(data)
      {
        this.entete = {
         authorization: "Bearer "+data,
        };
      }
    });
  }

  public getData(method="", data: {}, headers: {} = this.entete): Observable<any>
  { 
    let back: Observable<any>;
    if(headers == {})
      headers = this.entete;
    
    if(!this.native)
    {
      back = this.httpClient.get(this.api_url+method, {
        headers: headers,
        params: data
      });
    }
    else
    {
      let backThen = this.http.get(this.api_url+method, data, headers);
      back = from(backThen).pipe()
    }
    return back;
  }
  public setTestServer()
  {
    this.api_url = "https://octra.io";
  }
  public postData(method, params, entetes: {} = this.entete): Observable<any>
  {
    // method = "/createClient/"
    // this.setTestServer()
    if(this.native)
    {
      // debugger
      let backThen = this.http.post(this.api_url+method, params, entetes);
      return from(backThen);
    }
    else
    {
      return this.httpClient.post(this.api_url+method, params, {
        responseType: 'json',
        headers:entetes
      });
    }
  }
  public load(params, entetes: {} = this.entete): Observable<any>
  {
    // method = "/createClient/"
    // this.setTestServer()

    if(this.native)
    {
      // debugger
      let backThen = this.http.post("https://octra.io/octram/action_mobile.php", params, entetes);
      return from(backThen);
    }
    else
    {
      return this.httpClient.post(this.api_url, params, {
        responseType: 'json',
        headers:entetes
      });
    }
  }

  putData(method, params, entetes: {} = this.entete): Observable<any> {
    
    if(this.native)
    {
      let backThen = this.http.put(this.api_url+method, params, entetes);
      return from(backThen);
    }
    else
    {
      return this.httpClient.put(this.api_url+method, params, {
        responseType: 'text',
        headers:entetes
      });
    }
  }
  deleteData(method, entetes: {} = this.entete) {
    if(this.native)
    {
      let backThen = this.http.delete(this.api_url+method,{}, entetes);
      return from(backThen);
    }
    else
    {
      return this.httpClient.delete(this.api_url+method, {
        responseType: 'text',
        headers:entetes
      });
    }
  }
}
