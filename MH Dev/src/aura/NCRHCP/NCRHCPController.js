({
	doInit : function(component, event, helper) {
         // set permissions to disable to begin with
      

        component.set("v.disableOtherCreds", "true");
        
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
        
        
    },
    
    credentialsChanged: function (component, event, helper) {

        var result = event.getSource().get("v.value");
        var hcp = component.get("v.newHCP");
        hcp.Provider_Credentials__c = result;
        
        if (result == 'Other') {
            component.set("v.disableOtherCreds", false);
        } else {
            component.set("v.disableOtherCreds",true);

        }         
    },
    
    validate: function(component, event, helper) {
        alert ('calling validate HCP');
    },

    toggleHCPPanel:function( cmp, event) {
        var id = cmp.getGlobalId()+ cmp.get("v.HCPNum");
        document.getElementById(id);
        $A.util.toggleClass(document.getElementById(id), 'slds-hide');
        if ($A.util.hasClass(document.getElementById(id), 'slds-hide'))
            event.getSource().set("v.iconName", "utility:chevronright")
         else
            event.getSource().set("v.iconName", "utility:chevrondown")   
    },
    
    signerChanged: function(component, event ) {
        // TODO ISSUE: why do i have to do this? Why isn't the thing bound in the component?
		component.set("v.newHCP.Signer__c", event.getSource().get("v.checked"));
    }
   
})