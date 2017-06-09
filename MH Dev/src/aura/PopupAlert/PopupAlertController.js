({
    handlePopMessage : function (component, event, helper) {

debugger;
        //component.find("messagesId").getElement().scrollIntoView(true);
        // Obtain the received message and state to determine what type of message to show
        // then delegate the work to our helper
        var state = event.getParam("state");
        var message = event.getParam("message");
        var clearAllMessages = event.getParam("clearAllMessages");
        var isSalesforce1 = event.getParam("isSalesforce1");
        
        if(clearAllMessages === true || clearAllMessages === 'true') {
            helper.handleClose(component, event);
            //component.set("v.messages", []); 
            debugger;
            return;
        }
        if(state.toUpperCase() === 'SUCCESS') {
            helper.handleConfirmationMessage(component, message, isSalesforce1);
        } else if(state.toUpperCase() === 'ERROR') {
            helper.handleErrorMessage(component, message, isSalesforce1);
        }
    },

    closePopup : function(component, event, helper) {
        helper.handleClose(component, event);
    }

})