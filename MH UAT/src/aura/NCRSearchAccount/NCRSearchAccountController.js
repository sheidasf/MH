({
    searchAccountJS : function(component, event, helper) {
        //TODO: Clear existing acocunt information
        debugger;
        var inputCmp = component.find("nameId");
        var searchName = inputCmp.get("v.value");
        
        // Is input null?
        if ($A.util.isEmpty(searchName)) {
            // Set error
            inputCmp.showHelpMessageIfInvalid();
        }  else {
            // Clear error
            inputCmp.set("v.errors", null);
             
            var action = component.get("c.searchAccount");
            alert('Searching for' + searchName);
            action.setParams({MHId : searchName });
            action.setCallback(this, function(response){
                if(component.isValid() && response !== null && response.getState() == 'SUCCESS'){
                    component.set("v.clientAccount", response.getReturnValue() );
                    component.set("v.existingAct", true );                                
                } else {
                    debugger;
                    var errorMessage = $A.get("e.c:PopMessageEvent");
                    errorMessage.setParams({
                        "state": 'ERROR',
                        "message": 'Can not find the requested account'
                    });
                    errorMessage.fire();                    
                }
            });
            
            $A.enqueueAction(action);		
        } 
    } 
})