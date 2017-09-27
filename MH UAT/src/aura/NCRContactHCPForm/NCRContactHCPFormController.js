({
    doInit : function(component, event, helper) { 
        
        component.find ("v.ackText", $A.get("$Label.c.NCRAckGeneral"));
        // set permissions to disable to begin with
        component.set("v.disablePermissions", true);
        component.set("v.disableOtherCreds", true); 
        component.set("v.disableHCPInfo", true);
        component.set("v.disableSigner", true);
        debugger;
        if (component.get("v.newContact.Is_Physician__c") == true ) {
            component.find("credId").set("v.value", component.get("v.newContact.Provider_Credentials__c"));   
            component.find("hcpId").set("v.checked", true); 
            component.set("v.disableSigner", false); 
            component.set("v.disableHCPInfo", false);
            if (component.get("v.newContact.Provider_Credentials__c") == 'Other') {
            	component.set("v.disableOtherCreds", false);
            }
        }
        //indirects for prospects are not editable
        if(component.get("v.isProspectAccount") && !component.get("v.newContact.isDirect__c"))
        {
            component.set("v.isReadOnly", true);  
        } 
            var action2 = component.get("c.getPicklistvalues"); 
            action2.setParams({ objName: 'Contact', field_apiname: 'Provider_Credentials__c' }); 
            var opts2=[];
            action2.setCallback(this, function(a) {                
                for(var i=0;i< a.getReturnValue().length;i++){
                    opts2.push({"class": "optionClass", label: a.getReturnValue()[i], value: a.getReturnValue()[i]});
                }
                component.set("v.credentialsOptions", opts2);
            });
            $A.enqueueAction(action2); 
             
        
        var action = component.get("c.getPicklistvalues"); 
        action.setParams({ objName: 'User_Permissions__c', field_apiname: 'Online_User_Permissions__c' }); 
        var opts=[];
        action.setCallback(this, function(a) {
            debugger;
            for(var i=0;i< a.getReturnValue().length;i++){
                opts.push({"class": "optionClass", label: a.getReturnValue()[i], value: a.getReturnValue()[i]});
            }
            component.set("v.permissionOptions", opts);            
        });
        $A.enqueueAction(action); 
         
        // get NCR settings.       
        var action3 = component.get("c.getNCRSetting");
        action3.setStorable();
        action3.setCallback(this, function(response){
            
            if(component.isValid() && response !== null && response.getState() == 'SUCCESS'){
                //saving custom setting to component attribute
                component.set("v.NCRsettings", response.getReturnValue() );
                console.debug(response.getReturnValue() );//Check the output
            }        
        });        
        $A.enqueueAction(action3);        
        var action2 = component.get("c.checkForSalesforce1");
        action2.setStorable();
        action2.setCallback(this, function(a) {
            
            if(a.getReturnValue()==true){
                // it is salesforce1, disable Submit, and require/show the signature
                component.set("v.isSalesforce1", true);
                $A.util.removeClass(component.find("signCheckboxId"), 'slds-hidden');
            }else {
                component.set("v.isSalesforce1", false);
                if (component.get("v.NCRsettings.Sign_when_Desktop__c") == true) {
                    // it is not salesforce1, but for testing, disable Submit, and require/show the signature
                    component.set("v.signatureRequired", true);
                    $A.util.removeClass(component.find("signCheckboxId"), 'slds-hidden');
                }
                else {
                    // keep slds-hidden for the signature 
                    component.set("v.signatureRequired", false);
                }
            }

        });
        $A.enqueueAction(action2);  
        
    },
    
    permissionsChanged: function(component) {
        var element = component.find("permissionsId"); 
        var perm = component.get("v.permission");
        perm.Online_User_Permissions__c = element.get("v.value");
    },
    
    showContactPanel:function( component, event) {
        debugger;
        var id = component.getGlobalId()+ component.get("v.ctNum");
        document.getElementById(id);
        $A.util.toggleClass(document.getElementById(id), 'slds-hide');
        if ($A.util.hasClass(document.getElementById(id), 'slds-hide'))
            event.getSource().set("v.iconName", "utility:chevronright")
            else
                event.getSource().set("v.iconName", "utility:chevrondown")   
                },
    
    onlineUserChanged: function(component, event, helper) {
        var result = event.getSource().get("v.checked");
        var perm = component.get("v.permission");
        perm.Online_User__c = result;
        
        if (result) {
            component.set("v.disablePermissions", false);
        } else {
            component.set("v.disablePermissions",true);
			component.set("v.permission.Online_User_Permissions__c", '--None--');      
            component.find("permissionsId").set("v.value",'--None--');   
        }
    },
    
    validate: function(component, event, helper) {
        
        // TODO. makes this so that it can work with all 4 contact modules.
        
        var params = event.getParam('arguments');
        if (params) {
            var errors = params.errorsParam;
        }      
    },
    primaryEmailChanged: function(component, event) {
        
        if (component.get("v.permission.Contact_Designation__c") ==  "Primary") {
            var inputTestType = event.getSource();
            var message = $A.get("e.c:NCRPrimaryEmailChangedEvent");
            message.setParams({
                "primaryEmail": inputTestType.get("v.value")
            });
            message.fire();  
        }
    },
    credentialsChanged: function (component, event, helper) {
        
        var result = event.getSource().get("v.value");
        var hcp = component.get("v.newContact");
        hcp.Provider_Credentials__c = result;
        
        if (result == 'Other') {
            component.set("v.disableOtherCreds", false);
        } else {
            component.set("v.disableOtherCreds",true);
        }         
    },
    
    validate: function(component, event, helper) {
       // alert ('calling validate HCP');
    },
       
   // this should only happen for new and Direct Contacts. For indirect they should not
   // be able to toggle this.
    hcpChanged: function(component, event ) {
        var result = event.getSource().get("v.checked");
        var ct = component.get("v.newContact");

        ct.Is_Physician__c = result;

        if (result) {
            component.set("v.disableHCPInfo", false);
            component.set("v.disableSigner", false);
        } else {
            debugger;
            component.set("v.disableHCPInfo",true);
            component.set("v.disableSigner", true);
            
            component.set ("v.newContact.NPI_ID__c", '');
            component.set ("v.newContact.Credentials__c", '');
            component.set ("v.newContact.Provider_Credentials__c", '');
            component.find("credId").set("v.value", '--None--');            
            component.find("signerId").set("v.checked", false);
            component.set ("v.permission.Signer__c", false);
        }
    },
    
    
    designationChanged:function(component, event ) {
        debugger;
        component.set("v.permission.Contact_Designation__c", event.getSource().get("v.value"));
        
        if (component.get("v.permission.Contact_Designation__c") ==  "Primary") {
            var pemail = component.get("v.permission.Email__c");
            if (typeof pemail != "undefined" && pemail != '' ) {
                var message = $A.get("e.c:NCRPrimaryEmailChangedEvent");
                message.setParams({
                    "primaryEmail": pemail
                });
                message.fire();  
            }
            
        }
    },
    
    signerChanged: function(component, event ) {
        // TODO ISSUE: why do i have to do this? Why isn't the thing bound in the component?  - try Checked attribute in the markup.
        component.set("v.permission.Signer__c", event.getSource().get("v.checked"));
        
        var signerChangedEvent = $A.get("e.c:NCR_Signer_Changed_Event");
        signerChangedEvent.fire();
    },

    showOverrideDuplicate: function (component, event, helper) {
    	$A.util.removeClass(component.find("dupId"), 'slds-hidden');
    },
    
    //Added by JS
    populateContactValues: function(component, event ) {
       
        var action = component.get("c.getContactDetails");
        
        action.setParams({
            			  contactRecordID: event.getSource().get("v.value") ,
                          accountRecordID: component.get("v.act.Id")
                         });
        
        action.setCallback(this, function(response) {
            
            var contactDetails = response.getReturnValue();
            if(contactDetails != null){
                debugger;
                contactDetails.sobjectType = 'Contact';
                component.set("v.newContact.FirstName",contactDetails.FirstName); 
               	component.set("v.newContact.MiddleName",contactDetails.MiddleName);	
                component.set("v.newContact.LastName",contactDetails.LastName); 
                component.set("v.newContact.Email",contactDetails.Email); 
                component.set("v.permission.Email__c",contactDetails.Email);
                component.set("v.newContact.Phone",contactDetails.Phone); 
                component.set("v.newContact.MobilePhone",contactDetails.MobilePhone);
                
                component.set("v.newContact.Title",contactDetails.Title);
                component.set("v.newContact.Preferred_name__c",contactDetails.Preferred_name__c);
                component.set("v.newContact.NPI_ID__c",contactDetails.NPI_ID__c);
                
                component.set("v.newContact.Is_Physician__c", contactDetails.Is_Physician__c);
                component.set("v.newContact.Provider_Credentials__c", contactDetails.Provider_Credentials__c);
                component.set("v.newContact.Credentials__c", contactDetails.Credentials__c);

                component.set("v.newContact.id",contactDetails.Id);

                if (contactDetails.Is_Physician__c == true ) {
                    component.find("hcpId").set("v.checked", true); 
                	component.find("credId").set("v.value", component.get("v.newContact.Provider_Credentials__c")); 
                    component.set("v.disableSigner", false);
                } else {
                    component.find("hcpId").set("v.checked", false); 
                    component.set("v.disableSigner", true);
                }
				component.set("v.isReadOnly",true);

                if (contactDetails.Email != '' &&  component.get("v.permission.Contact_Designation__c") == 'Primary'){
                    var message = $A.get("e.c:NCRPrimaryEmailChangedEvent");
                    message.setParams({
                        "primaryEmail": contactDetails.Email
                    });
                    message.fire();                      
                }
            } 
            else
            {
                component.set("v.newContact.FirstName",""); 
                component.set("v.newContact.MiddleName","");
                component.set("v.newContact.LastName",""); 
                component.set("v.newContact.Email",""); 
                component.set("v.permission.Email__c","");
                component.set("v.newContact.Phone",""); 
                component.set("v.newContact.MobilePhone","");
                
                component.set("v.newContact.Title","");
                component.set("v.newContact.Preferred_name__c","");
                component.set("v.newContact.NPI_ID__c","");
                
                component.set("v.newContact.Is_Physician__c", false);
                component.set("v.newContact.Provider_Credentials__c", "");
                component.set("v.newContact.Credentials__c", "");
                
                component.find("hcpId").set("v.checked", false);
                component.set("v.disableSigner", true);

                component.set("v.permission.Signer__c", false);
                component.find("signerId").set("v.checked", false);

                component.set("v.permission.Online_User__c", false);
                component.find("onlineUserId").set("v.checked", false);
                
                component.set("v.permission.Online_User_Permissions__c", "--None--");
                
                component.set("v.newContact.id",null);
                component.set("v.isReadOnly",false);
            }
        }); 
        $A.enqueueAction(action); 
      
    }
})
    
})