({
     gotoURL : function (component, event, helper) {
        // same as Main Component
        debugger;
        if (component.get("v.isSalesforce1")) {

            var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
                "url": "/001/o"
            });
            urlEvent.fire();           
        } else {
            window.location.href='/001/o';
        }
    },
    
    reInit : function(component, event) {
    },
    
    toggleSpinner: function (component, event) {
        var spinner = component.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
    },

    validateContactV2: function(component, ct, perm, ctnumber, errors) {        
		// copied from Main 7/20
        var ctnumbername = ' Contact ' + ctnumber;
        var designation;
        var hcp;

        if (perm.Contact_Designation__c == 'Primary') {
            ctnumbername = 'Primary Contact/Health Care Provider';
            designation = perm.Contact_Designation__c;
        }
        else if (perm.Contact_Designation__c == 'Secondary' ) {
            ctnumbername = 'Secondary Contact/Health Care Provider';
            designation = perm.Contact_Designation__c;
        } else if (perm.Contact_Designation__c == 'Additional' ) {
                ctnumbername = 'Additional Contact/Health Care Provider # ' + ctnumber;
                designation = perm.Contact_Designation__c;
            }
        // first name/last name required for primary,       
        if (designation == 'Primary') {
            if (!ct.FirstName || !ct.LastName) {
                errors[errors.length] = '"First Name" and "Last Name" required for Primary Contact\n';  
            }
        } else if (ct.FirstName && !ct.LastName) {
            errors[errors.length] = '"Last Name" is required for ' + ctnumbername +  '.\n';
        }  
        
        // continue with other error checking.
        if (ct.FirstName) {  
            if (perm.Contact_Designation__c == '--None--' || typeof perm.Contact_Designation__c === "undefined") {
                errors[errors.length] = '"Contact Designation" is required for ' + ctnumbername +  '.\n';
            }
            
            if (perm.Online_User__c  && !perm.Email__c ) {
                errors[errors.length] = '"Email" is required for online users for ' + ctnumbername + '.\n';          
            }
            
            if (perm.Online_User__c && !perm.Online_User_Permissions__c) {
                errors[errors.length] = '"Permission" is required to setup for "Online User" for ' + ctnumbername + '.\n';
            }
            
            var regex = new RegExp('\[(][0-9]{3}[)] [0-9]{3}-[0-9]{4}|^[0-9]{10}$');

            if (ct.id == null) {
            	if ( ct.Phone && !regex.test(ct.Phone) ) {
               	 	errors[errors.length] = '"Phone" must be either 10 digits or (###) ###-#### for ' + ctnumbername  + '.\n';          
            	}
            	if ( ct.MobilePhone && !regex.test(ct.MobilePhone) ) {
                	errors[errors.length] = '"Mobile Phone" must be either 10 digits or (###) ###-#### for ' + ctnumbername  + '.\n';          
            	}                            
            }
        
            if ( ct.Is_Physician__c) {                
                // NPI and credentials is required for Medical practices
                debugger;
                if (component.get("v.MLISAccount.Testing_Purpose__c") == 'Medical') {
                    if ( !ct.NPI_ID__c ) {
                        errors[errors.length] = '"NPI" is required for ' +  ctnumbername + '.\n';            
                    } else {
                    	var regex = new RegExp('[0-9]{10}');
            			if ( ct.NPI_ID__c && !regex.test(ct.NPI_ID__c) ) {
                			errors[errors.length] = '"NPI" for ' + ctnumbername  + ' must be 10 digits.\n';          
            			}
                    }
                } 
                if ( ct.Provider_Credentials__c == '--None--' || !ct.Provider_Credentials__c ) {
                    errors[errors.length] = '"Credentials" is required for ' +  ctnumbername + '.\n';            
                }

                if ( ct.Provider_Credentials__c == 'Other'  && !ct.Credentials__c) {
                    errors[errors.length] = '"Other Credential" is required for ' +  ctnumbername + '.\n';            
                }
            }
            component.set('v.errorMsgs',  errors);
        }
    },
        
    validateV2 : function(component) {    
     	// copied from Main 7/20
        var errors = [];        
        
        //make sure that there is atleast primary contact inforamtion collected.
        var ctsPerms =  component.get('v.contactPerms');
        debugger;
              
        var signers=0;   
        var primaries =0;
        var secondaries =0;
       
        for (var i=0; i < ctsPerms.length; i++) {
            if (ctsPerms[i]) {
            	this.validateContactV2 (component, ctsPerms[i].key, ctsPerms[i].value, i+1 , errors); 
            	if (ctsPerms[i].key.FirstName && ctsPerms[i].value.Signer__c ) 
                	signers++;
            }

            
            if (ctsPerms[i].value.Contact_Designation__c == 'Primary') {
            	primaries++;                
            }

            if (ctsPerms[i].value.Contact_Designation__c == 'Secondary')
            	secondaries++   
        } 
      
        if ( component.get('v.signatureRequired') == true) {
            if (signers == 0) {
                errors[errors.length] = 'One Health Care Provider/Authorized Requestor needs to be designated as the signer.\n';            
            } else if ( signers > 1) {
                errors[errors.length] = 'Only one Health Care Provider/Authorized Requestor can be designated as the signer.\n';           
            }         
        }
        
        if (primaries == 0) {
                errors[errors.length] = 'You must designate one contact as Primary Contact.\n';           
        } else if (primaries > 1) {
                errors[errors.length] = 'You cannot have more than one Primary Contact.\n';                       
        } 
        if (secondaries > 1) {
                errors[errors.length] = 'You cannot have more than one Secondary Contact.\n';           
        } 
        // this method will not return anything, because it is calling the aura:method
        // for child forms and aura:methods can't return any return value.
        // so they are setting v.errorMsg which is passesd as the method's argument
        var childComponent = component.find('accountCompId');
        childComponent.validateAct(errors);
        
        // Validate the Notification settings.  
        
        var validEmails = [];        
        for (i=0; i< ctsPerms.length; i++) {
            if (ctsPerms[i].value.Email__c) {
                validEmails.push(ctsPerms[i].value.Email__c);
            }
        } 
        var childComponent = component.find('NotificationCompId');
        childComponent.validateNotification(errors, validEmails );
        
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
    
    finalSubmitV2: function (component, helper, event) {
    	// copied 7/20 except passing true for existing.
    	var serviceOnly;
        var action = component.get("c.createNCRV3"); 
        var ctPerms = component.get("v.contactPerms");
    
        debugger;
        var hcpContacts = [];
        for (var i=0; i < ctPerms.length; i++) {
        	var hcpContact = new Object();            
            hcpContact.cont = ctPerms[i].key;
            hcpContact.perm = ctPerms[i].value;
            hcpContacts.push (hcpContact);
        } 
        
        component.set("v.HCPContacts", hcpContacts); 
 
       if (component.get("v.isClientAccount") == 'True')
           serviceOnly = true;
        else
            serviceOnly = false;       
        //alert ('service only' + serviceOnly);
        
        action.setParams({
            "cActString": JSON.stringify(component.get("v.clientAccount")),
            "MLISString": JSON.stringify(component.get("v.MLISAccount")),
            "hcpContactString" : JSON.stringify(component.get("v.HCPContacts")),
            "signatureStringParam" : JSON.stringify(component.get("v.base64Image")),
            "existing" : true,
            "serviceAccountOnly" : serviceOnly,
			"salesforce1": component.get("v.isSalesforce1")
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
                	if (msg.indexOf('DUPLICATE DETECTED') !== -1 ) {
                        alert (msg);
                        if (msg.indexOf('Account') !== -1 ) {
                        	//$A.util.removeClass(component.find("ctDupId"), 'slds-hidden');
							var message2 = $A.get("e.c:NCRDuplicateAccountDetectedEvent");
                        	message2.fire();  
                    	}
                            
                        if (msg.indexOf('Contact') !== -1) {
                        	//$A.util.removeClass(component.find("actDupId"), 'slds-hidden');
							var message3 = $A.get("e.c:NCRDuplicateContactDetectedEvent");
                        	message3.fire();                              
                        }                        
                    }
                    helper.displayResults (component, msgType, title, msg); 
                } else {  
                    var msgType = 'success';         
                    var title = 'SUCCESS';
                    var msg = 'Account was created successfully.';
                    
                    // this will disable the submit since we don't want them to submit again
                    component.set("v.isSigned", false);
                    alert ('account created successfully');
                    helper.gotoURL(component, helper, event);
                }                  
                
                //we will only get ERROR for unhandled exception. 
            } else if (a.getState().toUpperCase() === "ERROR") {
                alert ('Error occurred during creation of the account. Please see messages.');
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