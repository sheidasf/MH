({  
    gotoURL : function (component, event, helper) {
        debugger;f
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": "/001/o"
        });
        urlEvent.fire();
    },
        
    hideErrorPanel : function(component, event, helper) {
        var e = component.find("ErrorPanelId");
        $A.util.addClass(e, 'slds-hidden');
    },
       
    popNewContactModal : function(component, event, helper) {
        alert('pop modal')
    },
    
    doInit : function(component, event, helper) {
        
        //component.set("v.errorMsgs", []);
        component.set("v.existingAccount", false);
        component.set("v.disableSubmit", true);
        component.set("v.isSigned", false);
        
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
            }else {
                component.set("v.isSalesforce1", false);
            }
        });
        $A.enqueueAction(action);
        
    },
    
    submitForm : function(component, event, helper) {
        
        // close any existing error boxes
        helper.clearErrors(component);
        
        // initialize the v.errrMsgs so every subcomponent can add to it.
        component.set("v.errorMsgs", []);
        
        helper.validate(component);   
        
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
            helper.finalSubmit(component, helper);
        } 
        
    },
    
    acknowledgeAndSign : function(component, event, helper) {       
        
        // Validate before allowing to sign
        helper.clearErrors(component);        
        component.set("v.errorMsgs", []);        
        //helper.validate(component);   
        
        var errors = component.get("v.errorMsgs");
        if (errors.length > 0) {           
            var msg = "Validation error with data entered. please fix the errors and re-submit.\n";
            for (i=0 ; i < errors.length; i++) {
                msg = msg + errors[i]
            }
            helper.displayResults (component, 'error', 'Validaiton Errors', msg);  
            component.find("focusId").focus();           
        } else {           
            document.getElementById("ackAndSignBackGroundSectionId").style.display = "block";
            document.getElementById("ackAndSignSectionId").style.display = "block";
        }
         
    } 

    
})