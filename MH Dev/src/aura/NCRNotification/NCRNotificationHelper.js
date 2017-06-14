({
    validate : function (component, event) {
       
        var params = event.getParam('arguments');
        if (params) {
            var errors = params.errorsParam;
            var validEmails = params.validEmails;
        } 
        debugger;
        // Make sure atleast one notification form is selected for both registration and results
        if (!component.get("v.currResFaxNumber") && !(component.get("v.currResEmailAddress"))) {
            errors[errors.length] = 'Either "Fax" or "Email" must be provided for Results Notification.\n';
        }
        if (!component.get("v.currRegFaxNumber") && !(component.get("v.currRegEmailAddress"))) {
            errors[errors.length] = 'Either "Fax" or "Email" must be filled out for Registration information to be sent.\n';
        }
        
        //if email is selected for Results, Make sure that the results email notificaiton is one of the contact emails
        if (component.find("resEmailId").get("v.checked"))  {
            var validEmail = false;
            if (validEmails) {
                for (var i=0; i<validEmails.length; i++) {
                    if (component.get("v.currResEmailAddress") == validEmails[i]) {
                        validEmail = true;
                    }
                }}
            
            if (!validEmail) {
                errors[errors.length] = 'Results notification "Email" must be one of the contact emails.\n';             
            }
        }        
    },
    
    prepForSubmit : function (component) {
        // set the registration fax data
        if (component.find("regFaxId").get("v.checked")) {
            //component.set("v.clientAccount.Fax_Notification__c", true); 
            if (component.get("v.currRegFaxNumber")) {
                component.set("v.clientAccount.Fax_Notification_Number__c", component.get("v.currRegFaxNumber")); 
            }
        }
        
        // set the registration email data
        if (component.find("regEmailId").get("v.checked")) {
            //component.set("v.clientAccount.Email_Notification__c", true); 
            if (component.get("v.currRegEmailAddress")) {
                component.set("v.clientAccount.Email_Notification_Address__c", component.get("v.currRegEmailAddress")); 
            }
        }
        
        if (component.find("resFaxId").get("v.checked")) {
            //component.set("v.MLISAccount.Fax_Results__c", true); 
            if (component.get("v.currResFaxNumber")) {
                component.set("v.MLISAccount.Fax_Number__c", component.get("v.currResFaxNumber")); 
            }
        }
        
        // set the registration email data
        if (component.find("resEmailId").get("v.checked")) {
            //component.set("v.MLISAccount.Email_Results__c", true); 
            if (component.get("v.currResEmailAddress")) {
                component.set("v.MLISAccount.Email_Address__c", component.get("v.currResEmailAddress")); 
            }
        }
        
        
    }
})