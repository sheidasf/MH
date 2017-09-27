({
    
    doInit : function(component, event, helper) {
        //component.set("v.errorMsgs", []);
        component.set("v.existingAccount", false);
        component.set("v.signatureRequired", true);
        component.set("v.isSigned", false); 
        // in case signature is not required.
        component.set("v.base64Image", 'Not Required');
        
        // check whether we are in 'test' mode or production        
        var action = component.get("c.getNCRSetting");
        action.setStorable();
        action.setCallback(this, function(response){
            if(component.isValid() && response !== null && response.getState() == 'SUCCESS'){
                //saving custom setting to component attribute
                component.set("v.NCRsettings", response.getReturnValue() );
                console.debug(response.getReturnValue() );//Check the output
            }
            
        });        
        $A.enqueueAction(action);      
        // for now don't do toast, and just do the popup. cause i can't clear the toast message.
        //component.set("v.isSalesforce1", false);        
        // check for Salesforce1 so you can do toast messages
        action = component.get("c.checkForSalesforce1");
        action.setStorable();
        action.setCallback(this, function(a) {
            if(a.getReturnValue()==true){
                component.set("v.isSalesforce1", true);
                component.set("v.disableSubmit", true);
                $A.util.removeClass(component.find("signId"), 'slds-hidden');
            }else {
                component.set("v.isSalesforce1", false);
                component.set("v.signatureRequired", false);
                component.set("v.disableSubmit", false);
                // add slds-hidden to sign component
            }
        });
        $A.enqueueAction(action);
        
        // Now search for the account and contacts
        var action = component.get("c.searchAccount");	
        action.setParams({
            "recordId": component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            debugger;
            var msg, title, msgType;   
            // standard error handler
            if (response.getState() === "SUCCESS") {
                // for handled exceptions
                if (response.getReturnValue() == null ) {                        
                    msgType = 'error';
                    title = 'ERROR';
                    component.set("v.validState", false);
                    msg = 'Operation not possible for this account';
                    helper.displayResults (component, msgType, title, msg); 
                    
                } else {                       
                    component.set("v.clientAccount", response.getReturnValue());  
                    component.set("v.MLISAccount.Product_Combination__c", '');
                    
                    if(component.get("v.clientAccount.RecordType.Name") == 'Prospect Account'){
                        component.set("v.isProspectAccount", 'True');
                        component.set("v.showexistingcontacts", 'False');
                        
                    }  
                    if(component.get("v.clientAccount.RecordType.Name") == 'Client Account'){
                      /*  if(component.get("v.clientAccount.MLIS_Status__c") != 'Active')
                        {
                            msgType = 'error';
                            title = 'ERROR';
                            component.set("v.validState", false);
                            msg = 'Operation not possible for this account. Account is not active.';
                            helper.displayResults (component, msgType, title, msg);  
                        } */
                        component.set("v.isClientAccount", 'True');
                        component.set("v.showexistingcontacts", 'True');
                        
                    }    
                    // fire the fax/phone event for the notification component
                    if (component.get("v.clientAccount.Fax") != null) {
                        var message = $A.get("e.c:NCRFaxChangedEvent");
                        message.setParams({
                            "faxNumber": component.get("v.clientAccount.Fax")
                        });
                        message.fire();  
                    }
                    
                    var message3 = $A.get("e.c:NCRExistingAccountLoadedEvent");
                    message3.setParams({
                        "existingClientAccount": component.get("v.clientAccount")
                    });
                    message3.fire();
      
                    // now retreive contacts
                    var action1 = component.get("c.searchProspectContactsV2");	
                    action1.setParams({
                        "accountRecordId": component.get("v.recordId")
                    });
                    action1.setCallback(this, function(response) {
                        debugger;             
                        
                        var existingCts = [];
                        var contactPerms  = [];
                        var ct = {};
                        var perm = {};
                        
                        perm.sobjectType = 'User_Permissions__c';
                        ct.sobjectType = 'Contact';
                        ct.isDirect__c = true;
                        
                        if(response.getState() == 'SUCCESS' && response.getReturnValue() != null)
                        {
                            
                            var length = response.getReturnValue().length;   
                            
                            for (var i=0; i<length ; i++) {
                                
                                if (response.getReturnValue()[i] != null)
                                {   
                                    ct = response.getReturnValue()[i];
                                    
                                    perm = {};
                                    perm.sobjectType = 'User_Permissions__c';            
                                    perm.Email__c = ct.Email;
                                    
                                    if(component.get("v.isProspectAccount") == 'True')
                                    {
                                        contactPerms.push({value:perm, key:ct}); // Perm is always Null but has to be here
                                    }
                                    else if(component.get("v.isClientAccount") == 'True')
                                    {
                                        existingCts.push(ct); // Need for Existing Contacts List (If Record type is Client Account)
                                    }                                 
                                }    
                                
                            }
                            
                            // open up ONE contact form for "existing prospost" with 0 related contacts and for all "Client Accounts"
                            if(contactPerms.length== 0){
                                var emptyCt = {};
                                var emptyPerm = {};
                                emptyPerm.sobjectType = 'User_Permissions__c';
                                emptyCt.sobjectType = 'Contact';
                                emptyCt.isDirect__c = true;
                                
                                contactPerms.push(
                                    {value:emptyPerm, 
                                     key:emptyCt 
                                    }); 
                            }
                            
                            component.set("v.contactPerms",contactPerms);    
                            
                            
                            if(component.get("v.isClientAccount") == 'True')
                            {
                                component.set("v.existingcontacts",existingCts);
                                component.set("v.showexistingcontacts",'True'); // showexistingcontacts default is false
                            }                            
                        }     
                    });
                    
                    $A.enqueueAction(action1);
                    var serviceOnly;
                    if (component.get("v.isClientAccount") == 'True')
                        serviceOnly = true;
                    else
                        serviceOnly = false;

                    //we will only get ERROR for unhandled exception. 
                     
                }
            } else if (response.getState().toUpperCase() === "ERROR") {
                msgType = 'error'; 
                title = 'ERROR';
                msg = response.getError()[0].message;
                helper.displayResults (component, msgType, title, msg);
                component.find("focusId").focus();
            }
            
            
        });
        $A.enqueueAction(action);
        
    } ,
    submitForm : function(component, event, helper) {
        // ***** same as Main component *****
        // close any existing error boxes
        helper.clearErrors(component);
        
        // initialize the v.errrMsgs so every subcomponent can add to it.
        component.set("v.errorMsgs", []);
        
        helper.validateV2(component);   
        
        var errors = component.get("v.errorMsgs");
        if (errors.length > 0) {           
            var msg = "Validation error with data entered. please fix the errors and re-submit.\n";
            for (var i=0 ; i < errors.length; i++) {
                msg = msg + errors[i]
            }
            helper.displayResults (component, 'error', 'Validaiton Errors', msg);  
            component.find("focusId").focus();           
        } else {
            helper.toggleSpinner(component, helper, event);
            helper.doPreSubmitWork(component, helper);
            helper.finalSubmitV2(component, helper);
        } 
        
    },
    
    acknowledgeAndSign : function(component, event, helper) {       
        
        // Validate before allowing to sign
        helper.clearErrors(component);        
        component.set("v.errorMsgs", []);        
        helper.validateV2(component);   
        
        var errors = component.get("v.errorMsgs");
        if (errors.length > 0) {           
            var msg = "Validation error with data entered. please fix the errors and re-submit.\n";
            for (var i=0 ; i < errors.length; i++) {
                msg = msg + errors[i]
            }
            helper.displayResults (component, 'error', 'Validaiton Errors', msg);  
            component.find("focusId").focus();           
        } else {           
            document.getElementById("ackAndSignBackGroundSectionId").style.display = "block";
            document.getElementById("ackAndSignSectionId").style.display = "block";
        }
        
    },
    
    // Added by JS  
    addMoreContacts : function(component, event, helper) {
        
        var contactPerms  =component.get('v.contactPerms');
        if(contactPerms.length < 11)  
        {
            var newContact = {}; 
            newContact.sObjectType='Contact';
            newContact.isDirect__c = true;
            
            var userpermission = {};     
            userpermission.sobjectType = 'User_Permissions__c';
            
            contactPerms.push({value:userpermission, key:newContact});
            component.set("v.contactPerms ",contactPerms);    
            
        }
        else
        {
            msgType = 'error';
            title = 'ERROR';
            component.set("v.validState", false);
            msg = 'You cannot add more than 10 contacts at a time';
            helper.displayResults (component, msgType, title, msg); 
        }
        
    }, 
    
})