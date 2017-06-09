({
    doInit : function(component, event, helper) {
        
        var msg=["Greetings","no erors yet as of right now"];
        component.set("v.errorMsgs", ["Greetings","From"]); 
        alert ('set greeting:' + msg);
        debugger;
        
    },
    
    submitForm : function(component, event, helper) {   
        debugger;
        var msg = helper.validate(component);
        if ( msg.length != 0) {            
            alert (msg)         
        }
        else {
            debugger;
            var action = component.get("c.createNCR");    
            action.setParams({ "sContact": component.get("v.secondaryContact"),
                              "cAct": component.get("v.clientAccount"),
                              "MAccount": component.get("v.MLISAccount"),
                              "pContact": component.get("v.primaryContact")
                             });        
            
            action.setCallback(this, function(a) {
                if (a.getState() === "SUCCESS") {
                    alert("NCR account created successfully!"); 
                    //helper.showSuccessToast();
                } else if (a.getState() === "ERROR") {
                    alert("Error in creating NCR account!" + a.getError()); 
                    //helper.showErrorToast();
                    // $A.log("Errors", a.getError());
                } 
            });
            
            $A.enqueueAction(action);
        }
    }
})