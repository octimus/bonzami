export class ConsomationModel{
    Essence:any;
    Gasoil:any;
    Petrole:any;

    constructor(Essence:any,Gasoil:any,Petrole:any) {
        this.Essence = Essence;
        this.Gasoil = Gasoil;
        this.Petrole = Petrole;
    }

    static fromMap(m: any): ConsomationModel {
        return new ConsomationModel(m['Essence'], m['Gasoil'], m['Petrole']);
    }
}

export class ConsomationResponse {
    consomTickets: ConsomationModel;
    consomVehicules: ConsomationModel;

    constructor(consomTickets: any, consomVehicules:any){
        this.consomTickets = consomTickets;
        this.consomVehicules = consomVehicules;
    }

    static fromMap(m: any): ConsomationResponse {
        return new ConsomationResponse(ConsomationModel.fromMap(m['consomTickets']), ConsomationModel.fromMap(m['consomVehicules']));
    }
}