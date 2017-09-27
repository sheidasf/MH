({  

/*        
    hideErrorPanel : function(component, event, helper) {
        var e = component.find("ErrorPanelId");
        $A.util.addClass(e, 'slds-hidden');
    },
       
    popNewContactModal : function(component, event, helper) {
        alert('pop modal')
    },
*/    
    doInit : function(component, event, helper) {
        // populate the first contact/perm   
        var contactPerms = [];
        contactPerms.push(
            {value:component.get("v.userPermission"), 
             key:component.get("v.contact") 
            }); 
        component.set("v.contactPerms ",contactPerms);  
        
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
                // it is salesforce1, disable Submit, and require/show the signature
                component.set("v.isSalesforce1", true);
                component.set("v.disableSubmit", true);
                $A.util.removeClass(component.find("signId"), 'slds-hidden');
            }else {
                component.set("v.isSalesforce1", false);
                if (component.get("v.NCRsettings.Sign_when_Desktop__c") == true) {
                	// it is not salesforce1, but for testing, disable Submit, and require/show the signature
                    component.set("v.signatureRequired", true);
                    component.set("v.disableSubmit", true);
                    $A.util.removeClass(component.find("signId"), 'slds-hidden');
                }
                else {
                    // keep slds-hidden for the signature 
                    component.set("v.signatureRequired", false);
                    component.set("v.disableSubmit", false);
                }
            }
        });
        $A.enqueueAction(action);        
    },
    
    submitForm : function(component, event, helper) {
        // ***** same as Existing component *****
        helper.clearErrors(component);
        
        // initialize the v.errrMsgs so every subcomponent can add to it.
        component.set("v.errorMsgs", []);
        
        helper.validateV2(component);   
        
        var errors = component.get("v.errorMsgs");
        if (errors.length > 0) {           
            var msg = "Validation error with data entered. please fix the errors and re-submit.\n";
            for (i=0 ; i < errors.length; i++) {
                msg = msg + errors[i]
            }
            helper.displayResults (component, 'error', 'Validaiton Errors', msg);  
            component.find("focusId").focus();           
        } else {
            helper.toggleSpinner(component, helper, event);
            helper.doPreSubmitWork(component, helper);
            helper.finalSubmitV2(component, helper);
            //this.gotoURL(component, event, helper);
        } 
        
    },
    
    acknowledgeAndSign : function(component, event, helper) {       
        // same as Main component
        // Validate before allowing to sign
        helper.clearErrors(component);        
        component.set("v.errorMsgs", []);        
        helper.validateV2(component);   
        var errors = component.get("v.errorMsgs");
        if (errors.length > 0) {           
            var msg = "Validation error with data entered. please fix the errors and re-submit.\n";
            for (i=0 ; i < errors.length; i++) {
                msg = msg + errors[i]
            }
            helper.displayResults (component, 'error', 'Validaiton Errors', msg);  
            debugger;
            component.find("focusId").focus();           
        } else {           
            document.getElementById("ackAndSignBackGroundSectionId").style.display = "block";
            document.getElementById("ackAndSignSectionId").style.display = "block";
        }
         
    } ,
      
    addMoreContacts : function(component, event, helper) {
        
        var contactPerms  =component.get('v.contactPerms');        
        if(contactPerms.length < 11)  
        {
            debugger;
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
        
    }

    
/*   injectComponent2: function (name, target) {
        $A.createComponent(name, { }, function (contentComponent, status, error) {
            if (status === "SUCCESS") {
                target.set('v.body', contentComponent);
            } else {
                throw new Error(error);
            }
        });
    },

    handleActive : function(component, event, helper) { 
        var tab = event.getSource();
        alert ('activating');

        switch (tab.get('v.id')) {
            case 'C1' :
                if (component.get("v.c1active") == false) {
                component.set("v.c1active", true);
                alert ('injest c1');
                $A.createComponent("c:NCRContactHCPForm", 
                                   {"newContact":  component.get("v.contacts"[0]), 
                                    "role":"Contact 1", 
                                    "ctNum":"1" , 
                                    "permission":component.get("v.userPermissions"[0])
                                    }, 
                                    function (contentComponent, status, error) {
            							if (status === "SUCCESS") {
                							tab.set('v.body', contentComponent);
            							} else {
                							throw new Error(error);
           			 					}
        							}
                                   );
        }
				break;
            case 'C2' :
                alert ('injest c2');
                this.injectComponent2 ("c:NCRContactHCPForm",  tab);
				break;
        }

    }
*/
    
})