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
                    component.set('v.clientAccount.BillingCity', 'Irvie');
                    component.set('v.clientAccount.BillingStateCode', 'CA');  
                    component.set('v.clientAccount.BillingStateCode', 'CA');  
                    component.set('v.clientAccount.Phone', '1234567890');  
                    component.set('v.clientAccount.Fax', '1234567890'); 
                    component.set('v.clientAccount.BillingPostalCode', '92602');          
                }
            }
            
        });        
        $A.enqueueAction(action);
        
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
        
        //retreive TestingPurpose
        var action3 = component.get("c.getPicklistvalues"); 
        action3.setParams({ objName: 'Account', field_apiname: 'Testing_Purpose__c' });
        action3.setStorable();
        opts3=[];
        action3.setCallback(this, function(response) {
            if(component.isValid() && response !== null && response.getState() == 'SUCCESS') {
                
                for(var i=0;i< response.getReturnValue().length;i++){
                    opts3.push({"class": "optionClass", 
                                label: response.getReturnValue()[i], value: response.getReturnValue()[i]});
                }
                component.set("v.testingOptions", opts3);
            }
        });
        $A.enqueueAction(action3);
        ///////////////////////////////////////////////////        
        // retrieve Product Combo
        
        var action6 = component.get("c.getPicklistLabelAndvalues"); 
        action6.setParams({ objName: 'Account', field_apiname: 'Product_Combination__c' }); 
        action6.setStorable();
        opts6=[];
        action6.setCallback(this, function(response) {
            if(component.isValid() && response !== null && response.getState() == 'SUCCESS') {
                debugger;
                var optionsMap = response.getReturnValue();              
                
                for(key in optionsMap) {
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
            var isValid = params.isValidParam; 
        } 
        debugger;
        
        // check for all the right patterns 
        if (! component.find("nameId").get("v.validity").valid) {
            errors[errors.length] = 'Invalid Practice Name.\n';
            isValid = "invalid";  
        }
        
        if (! component.find("NPIId").get("v.validity").valid) {
            errors[errors.length] = 'Invalid NPI number.\n';
            isValid = "invalid";  
        }         
        if (! component.find("line1Id").get("v.validity").valid) {
            errors[errors.length] = 'Address is required.\n';
            isValid = "invalid";  
        }   
        if (! component.find("cityId").get("v.validity").valid) {
            errors[errors.length] = 'City is required.\n';
            isValid = "invalid";  
        }   
        if (! component.find("stateId").get("v.validity").valid) {
            errors[errors.length] = 'State is required.\n';
            isValid = "invalid";  
        }   
        if (! component.find("zipId").get("v.validity").valid) {
            errors[errors.length] = 'Invalid or missing zip code.\n';
            isValid = "invalid";  
        }   
        if (! component.find("phoneId").get("v.validity").valid) {
            errors[errors.length] = 'Invalid or missing phone number.\n';
            isValid = "invalid";  
        }   
        if (! component.find("faxId").get("v.validity").valid) {
            errors[errors.length] = 'Invalid or missing fax number.\n';
            isValid = "invalid";  
        }  
        if (! component.find("cliaId").get("v.validity").valid) {
            errors[errors.length] = 'Invalid CLIA id.\n';
            isValid = "invalid";  
        }   
        
        // now test the drop downs
        var testingPurpose = component.get("v.clientAccount.Testing_Purpose__c") ;
        var actType = component.get("v.MLISAccount.Account_Type_Detail__c") ;
        var billingType = component.get("v.MLISAccount.Billing_Type__c") ;        
        
        if (testingPurpose == '--None--' || !testingPurpose) {
            errors[errors.length] = 'Testing purpose is required.\n';
            isValid = "invalid";            
        }
        
        if (actType == '--None--' || !actType) {
            errors[errors.length] = 'Account Type is required.\n';
            isValid = "invalid";            
        }
        
        if (billingType == '--None--' || !billingType) {
            errors[errors.length] = 'Billing Type is required.\n';
            isValid = "invalid";            
        }
        
        var ps = component.find("pspecialityId").get("v.value");  
        var ss = component.find("sspecialityId").get("v.value");   
        
        if (testingPurpose == 'Medical'  && 
            (ps == '--None--' || !ps)) {
            errors[errors.length] = 'Primary Specialty is required for Medical practices.\n';
            isValid = "invalid";
        }                 
        
        if (ps != '--None--' && ps && ps!='') {            
            if (ps  == ss) {                    
                errors[errors.length] = 'Primary Specialty must be different than Secondary Speciality.\n';
                isValid = "invalid";
            }
        }
        
        // validate that at least one testing type has been selected.
        if(!component.get("v.clientAccount.Product_Combination__c")) {
            errors[errors.length] = 'At least one testing type must be selected.\n';
            isValid = "invalid";
        }
    }
})