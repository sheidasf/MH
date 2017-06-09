/**
 * Created by tyler.mowbrey on 6/1/2017.
 */
({
    onInit : function (component, event, helper) {
        debugger;
        alert ('in init');
        helper.setupSignaturePad(component, event);
    },

    submitSignature : function(component, event, helper) {
                alert ('in submit');
        helper.submitSignature(component, event);
    },

    clearSignature : function(component, event, helper) {
        helper.clearSignature(component, event);
    }
})