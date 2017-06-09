({
    validateCLIA: function (component, auraId){
        
        debugger;

        //TODO
        //var regx = new RegExp ("[\d]{3}D[\d]{6}");
		var regx = new RegExp ("[\d]{1}");
        var v = component.get("v.clientAccount.CLIA__c");
        alert('in validate clia:' + v);
        if (regx.test(v)) {
            alert ('clia good');
            return "SUCCESS";
        }
        else {
            alert ('clia bad');
            return "Invalid CLIA format. CLIA must be in ###D######";
        }
    }, 
    
    
    validate : function(component) {
        alert('in validate');
        var allErrors = [];
        
        // check for primary and secondary specialty
        var p = component.get("v.clientAccount.Primary_Specialty__c");
        var s = component.get("v.clientAccount.Secondary_Specialty__c");
        
        alert ('specialties: ' + p + s);
        
        if (p == s)
            allErrors[allErrors.length] = 'can not select the same speciality for primary and secondary';
        
        // now check for CLIA ID
        debugger;
        var msg = this.validateCLIA(component, 'cliaId');
        if ( msg != 'SUCCESS'){
            allErrors[allErrors.length] = msg;
        }

        alert( 'errors:' + allErrors);
        component.set("v.errorMsgs", allErrors);        
        return allErrors;       
       
        
    },
})