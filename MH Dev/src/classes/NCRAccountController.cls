public class  NCRAccountController { 
    
    @AuraEnabled
    public static Boolean checkForSalesforce1 () {
        String theme = UserInfo.getUiThemeDisplayed();
        if(theme=='Theme4t'){
            return true;
        } else 
            return false;
    }
    
    // checking Git
    
    @AuraEnabled
    public static Account searchAccount (String MHId) {
        Account a = new Account();
        a= [select name, BillingStreet, BillingCity, BillingStateCode, BillingPostalCode 
            from Account where Millennium_Health_Account_No__c = :MHID];
        system.debug('search account for:' + MHId + a);
        return a;
    }

    
    @AuraEnabled
    public static String createNCR (String cActString, String MLISString, String contactsString,  
                                    String HCPsString, String signatureStringParam) {
        

        Account cAct = (Account) JSON.deserialize (cActString, Account.class);
        MLIS_Account__c mlis = (MLIS_Account__c) JSON.deserialize (MLISString, MLIS_Account__c.class);
        List<Contact> contacts = (List<Contact>) JSON.deserialize (contactsString, List<Contact>.class);
        List<Contact> HCPs = (List<Contact>) JSON.deserialize (HCPsString, List<Contact>.class);
        String  signatureString = (String) JSON.deserialize (signatureStringParam, String.class);                                
        List<Contact> validContacts = new List<Contact>();
        List<Contact> validHCPs = new List<Contact>();                         
          
        String errorMsg;
        Id realSignerId;
      
        if ( signatureString == null) {
            errorMsg =  'Signature is Null. A valid HCP must be signing the application';
            return errorMsg;
        }
               
        system.debug('Client Act' + cAct);
        system.debug('MLIS Act' + mlis);
        system.debug('contacts' + contacts);
        system.debug('contacts' + HCPs);       
        Savepoint sp = Database.setSavepoint();
         
        try {
            cAct.MLIS_Status__c  = 'In Progress';
            cAct.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('New Prospect Account').getRecordTypeId();
            Database.insert(cAct);
            
            mlis.Account__c = cAct.id;
            mlis.name = cAct.Name + '-' + mlis.Account_Type_Detail__c;
           
            mlis.MLIS_ID_Status__c  = 'In Progress';
            Database.insert(mlis);
             
            for (Contact ct : contacts) {
                if (!String.isBlank(ct.LastName)) {                   
                    ct.AccountId = cAct.id;
                    ct.Contact_Status__c = 'In Progress';  
                    system.debug('inserting ' +ct);
                    validContacts.add(ct);
                    if (ct.Is_MLIS_User__c)
                        ct.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('MLIS Contacts').getRecordTypeId();
                    else
                        ct.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Non-MLIS Contact').getRecordTypeId();
                }    
            }
            Database.insert(validContacts); 
            
            // add the HCPs.
            System.debug('inserting HCPs');
            for (Contact hcp : HCPs) {
                if (!String.isBlank(hcp.LastName)) {                   
                    hcp.AccountId = cAct.id;
                    hcp.Contact_Status__c = 'In Progress';  
                    system.debug('inserting ' +hcp);
                    if ( hcp.Signer__c ) {
                        hcp.encodedSignature__c = signatureString;
                        
                        String imgstring = '<img alt="Embedded Image"  src="' + signatureString + '"></img>';
                        System.debug(imgstring);
                        hcp.Signature__c = '<img alt="Embedded Image"  src="' + signatureString + '"></img>';
                    }
                    validHCPs.add(hcp);
                }    
            }
            if (validHCPs.size() > 0) 
                Database.insert(validHCPs); 

            
            return 'success';
            
        } catch (Exception  e) { 
            
            Database.rollback( sp ); 
            return  e.getMessage();
        }
    }  
    
    @AuraEnabled    
    public static NCR_Setting__c getNCRSetting() {
        NCR_Setting__c ncrSetting = NCR_Setting__c.getInstance('General');
        System.debug('in getNCRSetting' + ncrSetting);
        return ncrSetting;       
    }
    
    
    @AuraEnabled
    public static List<String> getPicklistvalues(String objName, String field_apiname){
        
        List<String> optionlist = new List<String> {'--None--'};        
            sObject sObj = Schema.getGlobalDescribe().get(objName).newSObject() ;
        Schema.sObjectType sobject_type = sObj.getSObjectType();
        Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe();
        Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap();
        
        List<Schema.PicklistEntry> pick_list_values = field_map.get(field_apiname).getDescribe().getPickListValues();
        System.debug(pick_list_values);
        for (Schema.PicklistEntry a : pick_list_values) {
            optionlist.add(a.getLabel());
        }
        System.debug('getting options for field_apiname' + optionlist);
        return optionlist;
    }
    
    @AuraEnabled
    // AuraEnabled doesn't support  List<SelectOption> so have to return JSON and deserialize later.
    // in the JS, we do JSON.parse( action.getReturnValue() );
    public static Map <String, String> getPicklistLabelAndvalues(String objName, String field_apiname){
        
        Map<String, String> optionlist = new Map<String, String>();
        optionlist.put ('--None--', '--None--');        
        sObject sObj = Schema.getGlobalDescribe().get(objName).newSObject() ;
        Schema.sObjectType sobject_type = sObj.getSObjectType();
        Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe();
        Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap();
        
        List<Schema.PicklistEntry> pick_list_values = field_map.get(field_apiname).getDescribe().getPickListValues();
        System.debug(pick_list_values);
        for (Schema.PicklistEntry a : pick_list_values) {
            optionlist.put (a.getLabel(), a.getValue());
        }
        System.debug('getting options for field_apiname' + optionlist);
        return optionlist;
    }
    
    @AuraEnabled
    public static List<String> getBillingTypeValues(String accType){
        //TODO - this is a dependent picklist and needs to be coded        
        List<String> optionlist = new List<String> {'--None--'};        
            return optionlist;
    }    
    
    @AuraEnabled
    public static List<String> getDependentAccountTypes (String testingPurpose) {
        
        List<Testing_Purpose_Account_Type__mdt> testPurposeActTypes = [SELECT Id, Testing_Purpose__c, Account_Types__c
                                                                       FROM Testing_Purpose_Account_Type__mdt ];
        
        
        List<String> optionlist = new List<String> {'--None--'}; 
            system.debug('1'+ testPurposeActTypes);
        for( Testing_Purpose_Account_Type__mdt testPurposeActType : testPurposeActTypes) {
            if (testPurposeActType.Testing_Purpose__c == testingPurpose) 
            {
                system.debug('2'+ testPurposeActType.Account_Types__c);
                List<String> actTypes = testPurposeActType.Account_Types__c.split(';');
                for( String aType : actTypes) {
                    optionlist.add(aType);
                }
                return optionlist;
            }                
        }
        
        return optionlist;
    }
    
    @AuraEnabled
    public static List<String> getDependentBillingType (String accountType) {
        
        List<accountTypeBillingType__mdt> aTypesBillingTypes = [SELECT Id, Account_Type__c, Billing_Types__c
                                                                FROM accountTypeBillingType__mdt ];
        
        List<String> optionlist = new List<String> {'--None--'}; 
            system.debug('1'+ aTypesBillingTypes);
        for( accountTypeBillingType__mdt atypeBType : aTypesBillingTypes) {
            if (atypeBType.Account_Type__c == accountType) 
            {
                system.debug('2'+ atypeBType.Account_Type__c);
                List<String> billingTypes = atypeBType.Billing_Types__c.split(';');
                for( String bType : billingTypes) {
                    optionlist.add(bType);
                }
                return optionlist;
            }                
        }
        return optionlist;
    }
    
    
}