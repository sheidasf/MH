({
    handleConfirmationMessage : function (component, message, isSalesforce1) {
        
        var title = "Confirmation:";
        
        if (isSalesforce1) {
                var toastEvent = $A.get("e.force:showToast");           
                toastEvent.setParams({
                    "title": title,
                    "message": message,
                    "type" : 'success',
                    "mode" : 'pesky'
                });
                toastEvent.fire();
        }
        // Set the type of message and delegate to internal help method
        
        var severity = "confirm";
        this.addMessage(component, title, severity, message);
        
    },
    
    handleErrorMessage : function (component, message, isSalesforce1) {
        
        var title = "Error Occurred:";  
        
        if (isSalesforce1) {
            alert ('Validation Errors occurred. Please see the errors on top of the page');
            /*
            var toastEvent = $A.get("e.force:showToast");           
            toastEvent.setParams({
                "title": title,
                "message": 'Validation Error occurred. Please see the errors top of the page',
                "type" : 'error',
                "mode" : 'pesky'
            });
            toastEvent.fire(); */
        }
        // Set the type of message and delegate to internal help method
        var severity = "error";
        this.addMessage(component, title, severity, message);
        
    },
    
    addMessage : function (component, title, severity, message) {
        
        
        // Dynamically create a message and output component.
        $A.createComponents([
            ["ui:message", {
                "title": title,
                "class" : "slds-container--medium",
                "severity": severity
            }],
            ["ui:outputText", {
                "value": message
            }],
            ["aura:html", {
                "tag" : "button",
                "HTMLAttributes" : {
                    "title" : "Close",
                    "class" : "slds-button slds-button--icon slds-float--right",
                    "onclick" : component.getReference("c.closePopup")
                }
            }],
            ["lightning:icon", {
                "iconName" : "utility:close",
                "alternativeText" : "Close",
                "class" : "slds-button__icon slds-icon--small slds-button__icon--right",
                "size" : "x-small"
            }],
            
            ["lightning:buttonIcon", {
                "iconName" : "utility:close",
                "alternativeText" : "Close",
                "class" : "slds-button__icon slds-icon--small slds-button__icon--right",
                "size" : "x-small",
                "display":"none" 
            }]
        ],
                            function (components) {
                                var messagingComponent = components[0];
                                var outputTextComponent = components[1];
                                var buttonComponent = components[2];
                                var iconComponent = components[3];
                                var hiddenComponentForFocusOnly = components[4];
                                
                                var buttonBody = buttonComponent.get("v.body");
                                buttonBody.push(iconComponent);
                                buttonComponent.set("v.body", buttonBody);
                                
                                var messagingBody = messagingComponent.get("v.body");
                                messagingBody.push(buttonComponent);
                                messagingBody.push(outputTextComponent);
                                messagingComponent.set("v.body", messagingBody);
                                
                                component.set("v.messages", messagingComponent);
                                debugger;
                                //hiddenComponentForFocusOnly.focus();
                                
                                if(severity === 'confirm') {
                                    window.setTimeout(
                                        $A.getCallback(function () {
                                            if(component.isValid()){
                                                component.set("v.messages", []);
                                            }
                                        }), 10000
                                    );
                                }
                            }
                           );
    },
    
    handleClose : function(component, event) {
        component.set("v.messages", []);
    }
})