({
	    loadInitialPicklistValues: function(component, event) {
        
        // check whether we are in 'test' mode or production        
        var action = component.get("c.getNCRSetting");
        action.setStorable();
        action.setCallback(this, function(response){
            if(component.isValid() && response !== null && response.getState() == 'SUCCESS'){
                //saving custom setting to attribute
                component.set("v.testMode", response.getReturnValue().Test__c );
                if ((response.getReturnValue().Test__c) == true) {
                    
                    var cact = component.get("v.clientAccount");
                    var mact = component.get("v.MLISAccount");
                    component.set('v.clientAccount.Name', 'Test Name');
                    component.set('v.clientAccount.CLIA__c', '12D3456789');
                    component.set('v.clientAccount.BillingStreet', '1 Coloma');
                    component.set('v.clientAccount.BillingCity', 'Irvine');
                    component.set('v.clientAccount.BillingStateCode', 'CA');  
                    component.set('v.clientAccount.BillingStateCode', 'CA');  
                    component.set('v.clientAccount.Phone', '1234567890');  
                    component.set('v.clientAccount.Fax', '1234567890'); 
                    component.set('v.clientAccount.BillingPostalCode', '92602');          
                }
            }
            
        });        
        $A.enqueueAction(action);
                
        //retreive TestingPurpose
        var action3 = component.get("c.getPicklistLabelAndvalues"); 
        action3.setParams({ objName: 'MLIS_Account__c', field_apiname: 'Testing_Purpose__c' });
        action3.setStorable();
        var opts3=[];
        action3.setCallback(this, function(response) {
            if(component.isValid() && response !== null && response.getState() == 'SUCCESS') {
                var optionsMap = response.getReturnValue();
                for(var key in optionsMap) {
                	//don't add None, we are defaulting to Medical
                	if (key != '--None--') {
                    var option = {class: "optionClass", label: key,
                    	value: optionsMap[key]};
                    if (key == 'Medical') option.selected = 'true';
                		opts3.push(option);
               	 	}
                }
                component.set("v.testingOptions", opts3);
                component.find("testingPurposeId").set("v.value",'Medical');
                this.testingPurposeChanged(component);
            }
        });
        $A.enqueueAction(action3);
            
            
        var action2 = component.get("c.getPicklistvalues"); 
        action2.setParams({ objName: 'Account', field_apiname: 'Primary_Specialty__c' }); 
        var opts2=[];
        action2.setCallback(this, function(response) {
            if(component.isValid() && response !== null && response.getState() == 'SUCCESS') {
                for(var i=0;i< response.getReturnValue().length;i++){
                    opts2.push({"class": "optionClass", label: response.getReturnValue()[i], value: response.getReturnValue()[i]});
                }
                component.set("v.pSpecialityOptions", opts2);
            }            
        });
        $A.enqueueAction(action2); 	
         
        
        var action = component.get("c.getPicklistvalues"); 
        action.setParams({ objName: 'Account', field_apiname: 'Secondary_Specialty__c' }); 
        var opts=[];
        action.setCallback(this, function(response) {
            if(component.isValid() && response !== null && response.getState() == 'SUCCESS') {
                
                for(var i=0;i< response.getReturnValue().length;i++){
                    opts.push({"class": "optionClass", label: response.getReturnValue()[i], value: response.getReturnValue()[i]});
                }
                component.set("v.sSpecialityOptions", opts);
            }
            
        });
        $A.enqueueAction(action); 	    
        ///////////////////////////////////////////////////        
        // retrieve Product Combo
        
        var action6 = component.get("c.getPicklistLabelAndvalues"); 
        action6.setParams({ objName: 'MLIS_Account__c', field_apiname: 'Product_Combination__c' }); 
        //action6.setStorable();   - this is messing up the order in which the values are displayed.
        var opts6=[];
        action6.setCallback(this, function(response) {
            if(component.isValid() && response !== null && response.getState() == 'SUCCESS') {
                debugger;
                var optionsMap = response.getReturnValue();              
                
                for(var key in optionsMap) {
                    // don't display None in the checkboxes.
                    if (key != '--None--') {
                        opts6.push({ class: "optionClass", label: key,
                                    value: optionsMap[key] });
                    }
                }
                component.set("v.ProductComboOptions", opts6); 
            }
        });
        $A.enqueueAction(action6); 
        
    },
    
    validateAccount: function (component, event)
    {
        var params = event.getParam('arguments');
        if (params) {
            var errors = params.errorsParam;
        }        
        debugger;
        
        // check for all the right patterns 
        if (component.find("nameId").get("v.validity").valueMissing) {
            errors[errors.length] = '"Account Name" is required.\n'; 
        } else if (! component.find("nameId").get("v.validity").valid) {
            errors[errors.length] = '"Account Name" can contain only letters, numbers, spaces, periods, hyphens, commas, underscores, forward slashes, and parentheses.\n';
        }
        
        if (! component.find("NPIId").get("v.validity").valid) {
            errors[errors.length] = '"NPI" field for the Practice must be 10 digits.\n'; 
        }        
        // check for physical address being required
        if (! component.find("line1Id").get("v.validity").valid) {
            errors[errors.length] = '"Physical Address Line 1" is required.\n'; 
        }   
        if (! component.find("cityId").get("v.validity").valid) {
            errors[errors.length] = '"Physical City" is required.\n'; 
        }   
        if (! component.find("stateId").get("v.validity").valid) {
            errors[errors.length] = '"Physical State" is required.\n';  
        }   
        if (! component.find("zipId").get("v.validity").valid) {
            errors[errors.length] = '"Physical Zip Code" is required and must be 5 or 9 digits.\n';  
        }   
        // check for shipping address being required
        if (! component.find("sLine1Id").get("v.validity").valid) {
            errors[errors.length] = '"Shipping Address Line 1" is required.\n'; 
        }   
        if (! component.find("sCityId").get("v.validity").valid) {
            errors[errors.length] = '"Shipping City" is required.\n'; 
        }   
        if (! component.find("sStateId").get("v.validity").valid) {
            errors[errors.length] = '"Shipping State" is required.\n';  
        }   
        if (! component.find("sZipId").get("v.validity").valid) {
            errors[errors.length] = '"Shipping Zip Code" is required and must be 5 or 9 digits.\n';  
        }   
        
        // check for primary billing address being required
        if (! component.find("bLine1Id").get("v.validity").valid) {
            errors[errors.length] = '"Billing Address Line 1" is required.\n'; 
        }   
        if (! component.find("bCityId").get("v.validity").valid) {
            errors[errors.length] = '"Billing City" is required.\n'; 
        }   
        if (! component.find("bStateId").get("v.validity").valid) {
            errors[errors.length] = '"Billing State" is required.\n';  
        }   
        if (! component.find("bZipId").get("v.validity").valid) {
            errors[errors.length] = '"Billing Zip Code" is required and must be 5 or 9 digits.\n';  
        }  
        
        if (! component.find("phoneId").get("v.validity").valid) {
            errors[errors.length] = '"Main Phone" is required.\n'; 
        }

        
        if (! component.find("faxId").get("v.validity").valid) {
            errors[errors.length] = '"Main Fax" is required and must be 10 digits.\n';  
        }  

        if  (component.get('v.isReadOnly') == false) { 
            
        	if (!component.find("phoneId").get("v.validity").valid)
        	{
            	errors[errors.length] = 'Invalid phone number. Phone number should be 10 digits or (###) ###-####.\n';            
        	}
        	if (!component.find("faxId").get("v.validity").valid)
        	{
            	errors[errors.length] = 'Invalid fax number. Fax number should be 10 digits or (###) ###-####.\n';            
        	}            
    	}

        
        if (! component.find("cliaId").get("v.validity").valid) {
            errors[errors.length] = 'CLIA Number" is in incorrect format.\n' 
        }   
        
        // now test the drop downs
        var testingPurpose = component.get("v.MLISAccount.Testing_Purpose__c") ;
        var actType = component.get("v.MLISAccount.Account_Type_Detail__c") ;
        var billingType = component.get("v.MLISAccount.Billing_Type__c") ;        
        
        if (testingPurpose == '--None--' || !testingPurpose) {
            errors[errors.length] = '"Testing purpose" is required.\n';      
        }
        
        if (actType == '--None--' || !actType) {
            errors[errors.length] = '"Account Type" is required.\n';          
        }
        
        if (billingType == '--None--' || !billingType) {
            errors[errors.length] = '"Billing Type" is required.\n';         
        }
        
        var ps = component.find("pspecialityId").get("v.value");  
        var ss = component.find("sspecialityId").get("v.value");   
        
        if (testingPurpose == 'Medical'  && 
            (ps == '--None--' || !ps)) {
            errors[errors.length] = '"Primary Specialty" is required for Medical practices.\n';
        }                 
        
        if (ps != '--None--' && ps && ps!='') {            
            if (ps  == ss) {                    
                errors[errors.length] = '"Primary Specialty" must be different than "Secondary Specialty".\n';
            }
        }
        
        // validate that at least one testing type has been selected.
        if(!component.get("v.MLISAccount.Product_Combination__c")) {
            errors[errors.length] = 'At least one "Testing Type" must be selected.\n';
        }
    },
    
    shippingSameAsPractice: function (component, event){
        debugger;
        component.set("v.shippingSameAsPractice", true); 
        component.find("sLine1Id").set("v.value", component.find("line1Id").get("v.value"));
        component.find("sCityId").set("v.value", component.find("cityId").get("v.value"));
        component.find("sStateId").set("v.value", component.find("stateId").get("v.value"));
        component.find("sZipId").set("v.value", component.find("zipId").get("v.value"));
    },

    billingSameAsPractice: function (component, event){
        debugger;
        component.set("v.billingSameAsPractice", true); 
        component.find("bLine1Id").set("v.value", component.find("line1Id").get("v.value"));
        component.find("bCityId").set("v.value", component.find("cityId").get("v.value"));
        component.find("bStateId").set("v.value", component.find("stateId").get("v.value"));
        component.find("bZipId").set("v.value", component.find("zipId").get("v.value"));
    },  
    
    clearShipping: function (component, event){
        component.set("v.shippingSameAsPractice", false); 
        component.find("sLine1Id").set("v.value", "");
        component.find("sCityId").set("v.value", "");
        component.find("sStateId").set("v.value","");
        component.find("sZipId").set("v.value", "");
    },
    
    clearBilling: function (component, event){
        component.set("v.billingSameAsPractice", false); 
        component.find("bLine1Id").set("v.value", "");
        component.find("bCityId").set("v.value", "");
        component.find("bStateId").set("v.value","");
        component.find("bZipId").set("v.value", "");
    },
    
    practiceAddressChanged: function (component, event){
        if (component.get("v.shippingSameAsPractice")) {
            component.find("sLine1Id").set("v.value", component.find("line1Id").get("v.value"));
            component.find("sCityId").set("v.value", component.find("cityId").get("v.value"));
            component.find("sStateId").set("v.value", component.find("stateId").get("v.value"));
            component.find("sZipId").set("v.value", component.find("zipId").get("v.value"));
        }
        if (component.get("v.billingSameAsPractice")) {
            component.find("bLine1Id").set("v.value", component.find("line1Id").get("v.value"));
            component.find("bCityId").set("v.value", component.find("cityId").get("v.value"));
            component.find("bStateId").set("v.value", component.find("stateId").get("v.value"));
            component.find("bZipId").set("v.value", component.find("zipId").get("v.value"));
        }
    },

    testingPurposeChanged: function (component, event, helper){  
        var val = component.find("testingPurposeId").get("v.value");
        component.set("v.MLISAccount.Testing_Purpose__c", val); 
        component.set("v.selectedTestingPurpose", val);
		component.set("v.MLISAccount.Account_Type_Detail__c", "--None--") ;
		component.set("v.MLISAccount.Billing_Type__c", "--None--") ;   
        component.set("v.selectedBillingType", "--None--");
        component.set("v.selectedAccountType", "--None--");
        component.set("v.disableBillingType", true);   
        
        //retreive valid account Types.
        var action = component.get("c.getDependentAccountTypes"); 
        action.setParams({ testingPurpose: val }); 
        var opts = [];
        action.setCallback(this, function(a) {
            if(component.isValid() && a !== null && a.getState() == 'SUCCESS'){
                for(var i=0; i< a.getReturnValue().length; i++){
                    opts.push({"class": "optionClass", label: a.getReturnValue()[i], value: a.getReturnValue()[i]});
                }
                component.set("v.accountTypeOptions", opts);
                component.set("v.disableAccountType", false);
            }
        });
        $A.enqueueAction(action);
	},
    faxChanged: function(component, event) {
            var inputTestType = event.getSource();
			var message = $A.get("e.c:NCRFaxChangedEvent");
            message.setParams({
                "faxNumber": inputTestType.get("v.value")
            });
            message.fire();  
    },
    
})