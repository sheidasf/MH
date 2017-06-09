public class NCRAccount {

    @AuraEnabled 
    public Account acc {get;set;}  
    @AuraEnabled 
    public Contact[] contacts {get;set;} 
    
    @AuraEnabled 
    public String name {get;set;}
    @AuraEnabled 
    public String phone {get;set;}
    @AuraEnabled 
    public String fax {get;set;}
    @AuraEnabled 
    public String pSpecialty {get;set;}
    @AuraEnabled 
    public String sSpecialty {get;set;}

    public NCRAccount() {
        
    }
}