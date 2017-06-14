({
   
    reInit : function(component, event) {
    },
    
    toggleSpinner: function (component, event) {
        var spinner = component.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
    },
    
    validateContact: function(component, ct, ctnumber, errors) {
    
        var ctnumbername;
        if (ctnumber == '1') 
            ctnumbername = 'Primary Contact';
        else if (ctnumber == '2' )
            ctnumbername = 'Secondary Contact';
        else 
            ctnumbername = 'Additional Contact # ' + ctnumber;
     
        // first name/last name required for primary,
        
        if (ctnumber == 1) {
            if (!ct.FirstName || !ct.LastName) {
            	errors[errors.length] = '"First Name" and "Last Name" required for Primary Contact\n';  
            }
        } else if (ct.FirstName && !ct.LastName) {
             errors[errors.length] = '"Last Name" is required for ' + ctnumbername +  '.\n';
        }             
       
        // continue with other error checking.
        if (ct.FirstName) {
                 
            if (ct.Is_MLIS_User__c && !ct.Email ) {
                errors[errors.length] = '"Email" is required for online users for ' + ctnumbername + '.\n';          
            }
            
            if (ct.Is_MLIS_User__c && !ct.Online_User_Permissions__c) {
                errors[errors.length] = '"Permission" is required to setup for "Online User" for ' + ctnumbername + '.\n';
            }
            
            var regex = new RegExp('[0-9]{10}');
            if ( ct.Phone && !regex.test(ct.Phone) ) {
                errors[errors.length] = '"Phone" is invalid for ' + ctnumbername  + '.\n';          
            }
            if ( ct.MobilePhone && !regex.test(ct.MobilePhone) ) {
                errors[errors.length] = '"Mobile Phone" is invalid for ' + ctnumbername  + '.\n';          
            }
            
            component.set('v.errorMsgs',  errors);
        } 
    },
    
    validateHCP: function(component, hcp, hcpNumber, errors) {

         var hcpnumbername;
        if (hcpNumber == '1') 
            hcpnumbername = 'Primary Health Care Provider/Authorized Requestor';
        else if (hcpNumber == '2' )
            hcpnumbername = 'Secondary Health Care Provider/Authorized Requestor';
        else 
            hcpnumbername = 'Additional Health Care Provider/Authorized Requestor # ' + hcpNumber;
        
        // first name/last name required for primary, 
        
        if (hcpNumber == 1) {
            if (!hcp.FirstName || !hcp.LastName) {
           	errors[errors.length] = '"First Name" and "Last Name" required for Primary Health Care Provider/Authorized Requestor\n';  
            }
        } else if (hcp.FirstName && !hcp.LastName) {
            // first name is a key to know that we need to validate the HCP entered
            errors[errors.length] = '"Last Name" is required for ' + ctnumbername +  '.\n';  
        }   
           
        // continue with other error checkings.
        if (hcp.FirstName) {
            if ( !hcp.Provider_Credentials__c || hcp.Provider_Credentials__c == '--None--' ) {
                errors[errors.length] = '"Credential" is required for ' + ctnumbername +  '.\n';             
            }            
            // NPI and credentials is required for Medical practices
            if (component.get("v.clientAccount.Testing_Purpose__c") == 'Medical') {
                if ( !hcp.NPI_ID__c ) {
                    errors[errors.length] = '"NPI" is required for ' +  ctnumbername + '.\n';            
                }
            }            
            if ( hcp.Provider_Credentials__c == 'Other'  && !hcp.Credentials__c) {
                errors[errors.length] = '"Other Credential" is required for ' +  ctnumbername + '.\n';            
            }
        }
            
    },
    
    validate : function(component) {    
        
        var errors = [];        
        
        //make sure that there is atleast primary contact inforamtion collected.
        var cts = component.get('v.contacts');
        var HCPs = component.get('v.HCPs');
        debugger;
        
        for (i=0; i<4; i++) {
            this.validateContact (component, cts[i], i+1 , errors); 
        }
        
        debugger;
        // this method will not return anything, because it is calling the aura:method
        // for child forms and aura:methods can't return any return value.
        // so they are setting v.errorMsg which is passesd as the method's argument
        var childComponent = component.find('accountCompId');
        childComponent.validateAct(errors);
        
        // Validate the Notification settings.
        
        var validEmails = [];
        
        for (i=0; i< 3; i++) {
            if (cts[i].Email) {
                validEmails.push(cts[i].Email);
            }
        } 
        var childComponent = component.find('NotificationCompId');
        childComponent.validateNotification(errors, validEmails );

        
        var signers=0;
        for (i=0; i<4; i++) {
            this.validateHCP (component, HCPs[i], i+1 , errors); 
            if (HCPs[i].FirstName && HCPs[i].Signer__c ) 
                signers++;
        }
        if (signers == 0) {
            errors[errors.length] = 'One Health Care Provider/Authorized Requestor needs to be designated as the signer.\n';            
        } else if ( signers > 1) {
            errors[errors.length] = 'Only one Health Care Provider/Authorized Requestor can be designated as the signer.\n';           
        } 
        
        component.set('v.errorMsgs',  errors);
       
    },
    
    
    clearErrors: function(component) {
        debugger;
        
        var message = $A.get("e.c:PopMessageEvent");
        message.setParams({
            "clearAllMessages" : "true"
        });
        message.fire();  
        
    },

    displayResults : function(component, msgType, title, msg) {  
        var message = $A.get("e.c:PopMessageEvent");
        message.setParams({
            "state": msgType,
            "message": msg,
            "isSalesforce1" : component.get("v.isSalesforce1")
        });
        message.fire();          
    },
    
    
    doPreSubmitWork: function (component, helper) {
        var childComponent = component.find('NotificationCompId');
        childComponent.prepForSubmit();
    },
    
    finalSubmit: function (component, helper, event) {
        var action = component.get("c.createNCR"); 
        console.log('sig:' + component.get("v.base64Image"));
        action.setParams({
            "cActString": JSON.stringify(component.get("v.clientAccount")),
            "MLISString": JSON.stringify(component.get("v.MLISAccount")),
            "contactsString" : JSON.stringify(component.get("v.contacts")),
            "HCPsString" : JSON.stringify(component.get("v.HCPs")),
            "signatureStringParam" : JSON.stringify(component.get("v.base64Image"))
        });
        debugger;
        action.setCallback(this, function(a) {
            
            this.toggleSpinner(component, event);
            var msg, title, msgType;                 
            if (a.getState() === "SUCCESS") {
                // for handled exceptions
                if (a.getReturnValue().toUpperCase() != "SUCCESS") {                        
                    msgType = 'error';
                    title = 'ERROR';
                    msg = a.getReturnValue();
                } else {                       
                    var msgType = 'success';         
                    var title = 'SUCCESS';
                    var msg = 'Account was created successfully.';
                    
                    // this will disable the submit since we don't want them to submit again
                    component.set("v.isSigned", false);
                }                  
                helper.displayResults (component, msgType, title, msg); 
                //we will only get ERROR for unhandled exception. 
            } else if (a.getState().toUpperCase() === "ERROR") {
                msgType = 'error'; 
                title = 'ERROR';
                msg = a.getError()[0].message;
                helper.displayResults (component, msgType, title, msg);
                component.find("focusId").focus();
            } 
            
        });             
        $A.enqueueAction(action);         
    }  
})