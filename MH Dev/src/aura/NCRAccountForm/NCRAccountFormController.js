({   
    doInit : function(component, event, helper) {  
        
        // initialize variables
        component.set('v.disableSecondary', true);
        component.set('v.disableBillingType', true);
        component.set('v.disableAccountType', true);
        component.set('v.sameAsBilling', false);
        component.set('v.clientAccount.Product_Combination__c', '');
        
		helper.loadInitialPicklistValues (component, event);

    },
    
    validate: function(component, event, helper) {
        helper.validateAccount (component, event) ;
    }, 
        
    primarySpecialityChanged: function(component) {
        
        var val = component.find("pspecialityId").get("v.value");
        var act = component.get("v.clientAccount");
        act.Primary_Specialty__c = val;
        
        if (val != '--None--' && (!$A.util.isEmpty(val)))  {
            component.set("v.disableSecondary", false);
        } else {
            component.set("v.disableSecondary",true);
            component.find("sspecialityId").set("v.value", '--None--');
        }
    },
    
    testingPurposeChanged: function(component) {
        var val = component.find("testingPurposeId").get("v.value");;
        var act = component.get("v.clientAccount");
        act.Testing_Purpose__c = val;
        
        //retreive valid account Types.
        var action = component.get("c.getDependentAccountTypes"); 
        action.setParams({ testingPurpose: val }); 
        opts = [];
        action.setCallback(this, function(a) {
            if(component.isValid() && a !== null && a.getState() == 'SUCCESS'){
                for(var i=0; i< a.getReturnValue().length; i++){
                    opts.push({"class": "optionClass", label: a.getReturnValue()[i], value: a.getReturnValue()[i]});
                }
                component.set("v.accountTypeOptions", opts);
                component.set("v.disableAccountType",false);
            }
        });
        $A.enqueueAction(action);
    },
    
    secondarySpecialityChanged: function(component) {
        var element = component.find("sspecialityId");
        var act = component.get("v.clientAccount");
        act.Secondary_Specialty__c = element.get("v.value");
    },
    
    MLISAccountTypeChanged: function(component) {
        var val = component.find("actTypeId").get("v.value");
        var act = component.get("v.MLISAccount");
        act.Account_Type_Detail__c = val;
        
        //retreive valid Billing types
        var action = component.get("c.getDependentBillingType"); 
        action.setParams({ accountType: val }); 
        opts = [];
        action.setCallback(this, function(a) {
            if(component.isValid() && a !== null && a.getState() == 'SUCCESS'){
                for(var i=0; i< a.getReturnValue().length; i++){
                    opts.push({"class": "optionClass", label: a.getReturnValue()[i], value: a.getReturnValue()[i]});
                }
                component.set("v.billingTypeOptions", opts);
                component.set("v.disableBillingType",false);
            }
        });
        $A.enqueueAction(action);
        
    },
    
    MLISBillingTypeChanged: function(component) {
        var element = component.find("billingTypeId");
        var act = component.get("v.MLISAccount");
        act.Billing_Type__c = element.get("v.value");
    }, 
    
    testTypeChanged: function(component, event) {
        debugger;
        var act = component.get("v.clientAccount");
        var inputTestType = event.getSource();
        if (inputTestType.get("v.checked")) {
            act.Product_Combination__c = act.Product_Combination__c + inputTestType.get("v.label") + ';';
        } else {
            var s = act.Product_Combination__c;
            act.Product_Combination__c = s.replace (inputTestType.get("v.label")+ ';', '');   
        }	
    },
    

    productTypeChanged: function(component, event) {
     
        var act = component.get("v.clientAccount");
        var inputTestType = event.getSource();
        if (inputTestType.get("v.checked")) {
            act.Product_Combination__c = act.Product_Combination__c + inputTestType.get("v.name") + ';';
        } else {
            var s = act.Product_Combination__c;
            act.Product_Combination__c = s.replace (inputTestType.get("v.name")+ ';', '');   
        }	
    },
    
    sameAsBillingChanged: function(component, event, helper) {
     
        debugger;
        var act = component.get("v.sameAsBilling");
        var inputTestType = event.getSource();
        if (inputTestType.get("v.checked")) {
            helper.shippingSameAsBilling(component, event);    
        } else {
            var s = act.Product_Combination__c;
            helper.clearShipping(component, event);    
        }	
    },
    billingAddressChanged : function(component, event, helper) {
         helper.billingAddressChanged(component, event);
    },
    
    faxChanged: function(component, event) {
            var inputTestType = event.getSource();
			var message = $A.get("e.c:NCRFaxChangedEvent");
            message.setParams({
                "faxNumber": inputTestType.get("v.value")
            });
            message.fire();  
    }
})