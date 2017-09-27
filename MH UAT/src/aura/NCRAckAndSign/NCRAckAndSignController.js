({

    doInit: function(component, event, helper) {
        debugger;
        component.set("v.ackText", $A.get("$Label.c.NCRAckGeneral"));
        component.set("v.isSigned", false);
    },
    
   onInit : function (component, event, helper) {
        debugger;
        helper.setupSignaturePad(component, event);
    },
    
    closePopup : function(component, event, helper) {
        helper.closeModal(component);
	},
    
    
    signedAndAcknowledged: function(component, event, helper) {
           helper.signedAndAcknowledged(component, event);
    },
    submitSignature : function(component, event, helper) {
        helper.submitSignature(component, event);
    },

    clearSignature : function(component, event, helper) {
        helper.clearSignature(component, event);
    }
    
  
})