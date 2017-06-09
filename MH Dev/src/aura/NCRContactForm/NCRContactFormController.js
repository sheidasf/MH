({
    doInit : function(component, event, helper) {        
        
        
        var action2 = component.get("c.getPicklistvalues"); 
        action2.setParams({ objName: 'Contact', field_apiname: 'Online_User_Permissions__c' }); 
        var opts2=[];
        action2.setCallback(this, function(a) {
            for(var i=0;i< a.getReturnValue().length;i++){
                opts2.push({"class": "optionClass", label: a.getReturnValue()[i], value: a.getReturnValue()[i]});
            }
            component.set("v.permissionOptions", opts2);
            
        });
        $A.enqueueAction(action2); 	
        
        // set permissions to disable to begin with
        component.set("v.disablePermissions", "true");
        
        //alert ('globalId' +  component.getGlobalId());
    },
    
    permissionsChanged: function(component) {
        var element = component.find("permissionsId"); 
        var ct = component.get("v.newContact");
        ct.Online_User_Permissions__c = element.get("v.value");
    },
    
    showContactPanel:function( component, event) {
        debugger;
        var id = component.getGlobalId()+ component.get("v.ctNum");
        document.getElementById(id);
        $A.util.toggleClass(document.getElementById(id), 'slds-hide');
        if ($A.util.hasClass(document.getElementById(id), 'slds-hide'))
            event.getSource().set("v.iconName", "utility:chevronright")
         else
            event.getSource().set("v.iconName", "utility:chevrondown")   
    },
    
    onlineUserChanged: function(component, event, helper) {
        var result = event.getSource().get("v.checked");
        var ct = component.get("v.newContact");
        ct.Is_MLIS_User__c = result;
        
        if (result) {
            component.set("v.disablePermissions", false);
        } else {
            component.set("v.disablePermissions",true);
            //TODO ct.Online_User_Permissions__c = '--None--';
        }
    },
    
    validate: function(component, event, helper) {
        
        // TODO. makes this so that it can work with all 4 contact modules.
        
        var params = event.getParam('arguments');
        if (params) {
            var errors = params.errorsParam;
        }      
    },
    primaryEmailChanged: function(component, event) {

        if (component.get("v.ctNum") ==  "1") {
            var inputTestType = event.getSource();
			var message = $A.get("e.c:NCRPrimaryEmailChangedEvent");
            message.setParams({
                "primaryEmail": inputTestType.get("v.value")
            });
            message.fire();  
        }
    }
})