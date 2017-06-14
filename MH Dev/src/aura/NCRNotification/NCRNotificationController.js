({
    doInit : function(component, event, helper) {   
        // initialize variables for Notification
        component.set('v.disableResFax', true);
        component.set('v.disableResEmail', true);
        component.set('v.disableRegFax', true);
        component.set('v.disableRegEmail', true);
        
        component.set('v.currResFaxNumber', '');
        component.set('v.currResEmailAddress', '');
        component.set('v.currRegFaxNumber', '');
        component.set('v.currRegEmailAddress', '');
        
        component.set('v.practiceFaxNumber', '');
        component.set('v.primaryEmailAddress', '');
    },
    
    validate : function(component, event, helper) {   

        helper.validate(component, event );

    },
    
    resFaxSelected: function(component, event, helper) {
        var result = event.getSource().get("v.checked");
        
        if (result) {
            component.set("v.disableResFax", false);
            if (component.get("v.currResFaxNumber") == '') {
                component.set("v.currResFaxNumber",  component.get("v.practiceFaxNumber"));
            }
        } else {
            component.set("v.disableResFax",true);
            component.set("v.currResFaxNumber", '');
        }        
    },
    
    resEmailSelected: function(component, event, helper) {
        var result = event.getSource().get("v.checked");
        
        if (result) {
            component.set("v.disableResEmail", false);
            if (component.get('v.currResEmailAddress') == '') {
                component.set("v.currResEmailAddress",  component.get("v.primaryEmailAddress"));
            }
        } else {
            component.set("v.disableResEmail",true);
            component.set("v.currResEmailAddress", '');        }             
    },
    
    regFaxSelected: function(component, event, helper) {
        var result = event.getSource().get("v.checked");
        debugger;
        if (result) { 
            component.set("v.disableRegFax", false);
            if (component.get("v.currRegFaxNumber") == '') {
                component.set("v.currRegFaxNumber",  component.get("v.practiceFaxNumber"));
            } 
        } else {
            component.set("v.disableRegFax",true);
            component.set("v.currRegFaxNumber", '');
            
        }         
    },   
    
    regEmailSelected: function(component, event, helper) {
        var result = event.getSource().get("v.checked");
        
        if (result) {
            component.set("v.disableRegEmail", false);
            if (component.get('v.currRegEmailAddress') == '') {
                component.set("v.currRegEmailAddress",  component.get("v.primaryEmailAddress"));
            } 
        } else {
            component.set("v.disableRegEmail",true);
            component.set("v.currRegEmailAddress", '');
            
        }           
    },
    practiceFaxChanged: function(component, event, helper) {
        
        var newFax = event.getParam("faxNumber");
        if (!component.get("v.disableRegFax") && component.get("v.currRegFaxNumber")  === component.get("v.practiceFaxNumber")) {
            component.set('v.currRegFaxNumber', newFax);
        }
        if ( !component.get("v.disableResFax") &&  component.get("v.currResFaxNumber")  === component.get("v.practiceFaxNumber")) {
            component.set('v.currResFaxNumber', newFax);
        }
        component.set('v.practiceFaxNumber', newFax);
    },
    
    PrimaryEmailChanged: function(component, event, helper) {
        var  newEmail = event.getParam("primaryEmail");
        if (!component.get("v.disableRegEmail") && component.get("v.currRegEmailAddress")  === component.get("v.primaryEmailAddress")) {
            component.set('v.currRegEmailAddress', newEmail);
        }
        if (!component.get("v.disableResEmail") &&  component.get("v.currResEmailAddress")  === component.get("v.primaryEmailAddress")) {
            component.set('v.currResEmailAddress', newEmail);
        }
        component.set('v.primaryEmailAddress', newEmail);
    } ,
    
    prepForSubmit:function(component, event, helper) {
        helper.prepForSubmit(component);
    }
})