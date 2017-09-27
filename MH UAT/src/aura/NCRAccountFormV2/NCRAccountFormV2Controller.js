({   
    doInit : function(component, event, helper) {  
        
        // initialize variables
       component.set('v.disableSecondary', true);
        component.set('v.disableBillingType', true);
        component.set('v.disableAccountType', true);
        if (component.get('v.newAccount')) {
        component.set('v.shippingSameAsPractice', true);
        component.set('v.billingSameAsPractice', true);
        } else {
        component.set('v.shippingSameAsPractice', false);
        component.set('v.billingSameAsPractice', false);            
        }
        component.set('v.MLISAccount.Product_Combination__c', '');
		helper.loadInitialPicklistValues (component, event);

    }, 
    
    validate: function(component, event, helper) {
        helper.validateAccount (component, event) ;
    }, 

    primarySpecialityChanged: function(component) {
        
        var val = component.find("pspecialityId").get("v.value");
        var act = component.get("v.clientAccount");
        act.Primary_Specialty__c = val;
        component.set("v.selectedPS", act.Primary_Specialty__c);
        
        if (val != '--None--' && (!$A.util.isEmpty(val)))  {
            component.set("v.disableSecondary", false);
        } else {
            component.set("v.disableSecondary",true);
            component.find("sspecialityId").set("v.value", '--None--');
        }
    },
    
    testingPurposeChanged: function(component, event, helper) {
        helper.testingPurposeChanged(component);
    },
    
    secondarySpecialityChanged: function(component) {
        var element = component.find("sspecialityId");
        var act = component.get("v.clientAccount");
        act.Secondary_Specialty__c = element.get("v.value");
        component.set("v.selectedSS", act.Secondary_Specialty__c);
    },
    
    MLISAccountTypeChanged: function(component) {

        var val = component.find("actTypeId").get("v.value");
        component.set("v.MLISAccount.Account_Type_Detail__c", val); 
        component.set("v.MLISAccount.Billing_Type__c", "--None--"); 
        component.set("v.selectedBillingType", "--None--");
        component.set("v.selectedAccountType", val);
        debugger;
        //retreive valid Billing types
        var action = component.get("c.getDependentBillingType"); 
        action.setParams({ accountType: val }); 
        var opts = [];
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
        var val = component.find("billingTypeId").get("v.value");
        component.set("v.MLISAccount.Billing_Type__c", val); 
        component.set("v.selectedBillingType", val); 
    }, 


    productTypeChanged: function(component, event) {
     
        var act = component.get("v.clientAccount");
        var mact = component.get("v.MLISAccount");

        var inputTestType = event.getSource();
        if (inputTestType.get("v.checked")) {
            mact.Product_Combination__c = mact.Product_Combination__c + inputTestType.get("v.name") + ';';
        } else {
            var s = mact.Product_Combination__c;
            mact.Product_Combination__c = s.replace (inputTestType.get("v.name")+ ';', '');   
        }	
    },
    
    shippingSameAsPracticeChanged: function(component, event, helper) {
     
        debugger;
        var act = component.get("v.shippingSameAsPractice");
        var inputTestType = event.getSource();
        if (inputTestType.get("v.checked")) {
            helper.shippingSameAsPractice(component, event);    
        } else {
            // var s = act.Product_Combination__c;
            helper.clearShipping(component, event);    
        }	
    },
    
    billingSameAsPracticeChanged: function(component, event, helper) {
     
        debugger;
        var act = component.get("v.billingSameAsPractice");
        var inputTestType = event.getSource();
        if (inputTestType.get("v.checked")) {
            helper.billingSameAsPractice(component, event);    
        } else {
            var s = act.Product_Combination__c;
            helper.clearBilling(component, event);    
        }	
    },
    
    practiceAddressChanged : function(component, event, helper) {
         helper.practiceAddressChanged(component, event);
    },

    showOverrideDuplicate: function (component, event, helper) {
    	$A.util.removeClass(component.find("dupId"), 'slds-hidden');
    },
    
    populateFields: function (component, event, helper) {

        debugger;
   		var client = event.getParam("existingClientAccount");
        if (client.Primary_Specialty__c != null) {            
          component.set("v.clientAccount.Primary_Specialty__c", client.Primary_Specialty__c);
          component.set("v.selectedPS", client.Primary_Specialty__c);
          component.find("pspecialityId").set("v.value", client.Primary_Specialty__c);  
          component.set("v.disableSecondary", false);
        }

        if (client.Secondary_Specialty__c != null) {            
          component.set("v.clientAccount.Secondary_Specialty__c", client.Secondary_Specialty__c);
          component.set("v.selectedSS", client.Secondary_Specialty__c);
          component.find("sspecialityId").set("v.value", client.Secondary_Specialty__c); 
        }

        component.set("v.selectedTestingPurpose", 'Medical');
        var testingPurposeComponent = component.find("testingPurposeId");
        testingPurposeComponent.set("v.value",'Medical');
        helper.testingPurposeChanged(component);

           
    },
    faxChanged: function(component, event, helper) {
        helper.faxChanged(component, event);
    },

    formatPhone : function(component, event, helper)
    {   
		debugger;
       var ele = event.getSource();
        alert ('in format phone for' + ele.get("v.name") + 'val:' + ele.get("v.value"));
       var ph = ele.get("v.value");
       var ph1;
       if(ph.length == 10) {
            ph1 = '(' +  ph.substring(0, 3) + ')' + ph.substring(3, 6) + '-' + ph.substring(6, 10); 
        }
       ele.set("v.value",ph1 );
        /*
        alert (ele.get("v.name"));
        if (ele.get("v.name") == 'faxName') {
            alert ('fax changed event');
            helper.faxChanged (component, event);
        } */
         alert ('leaving');
    }

})