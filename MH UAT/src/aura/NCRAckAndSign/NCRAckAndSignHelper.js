({
    closeModal : function(component) {
        document.getElementById("ackAndSignBackGroundSectionId").style.display = "none";
        document.getElementById("ackAndSignSectionId").style.display = "none";				
    },
    
    
    /* msgtype = error/success
     * title = title of the msg
     * msg = the actual content of the message */
    displayResults : function(component, msgType, title, msg) {
        
        var message = $A.get("e.c:PopMessageEvent");
        message.setParams({
            "state": msgType,
            "message": msg,
            "isSalesforce1" : component.get("v.isSalesforce1")
        });
        message.fire();  
    },
    
    signedAndAcknowledged :function(component, event) {
        component.set("v.isSigned", true);
        var $sigdiv = $("#signature");
        var datapair = $sigdiv.jSignature("getData");

        //component.find("outputText").set("v.value", datapair);
        this.closeModal(component);
    },
    
    setupSignaturePad : function(component, event) {
        $(document).ready(function() {
            $("#signature").jSignature({height:"100px", width:"600px"})
        	var datapair = $("#signature").jSignature("getData");
        	component.set("v.initialBase64Image", datapair);
        });
    },
       
    submitSignature : function(component, event) {
        debugger;
        var $sigdiv = $("#signature");
        var datapair = $sigdiv.jSignature("getData");
        if (datapair == component.get("v.initialBase64Image")) {
            alert ('Please sign before saving signature');
        } else {
       	 	component.set("v.isSigned", true);
        	component.set("v.base64Image", datapair);
        }
    },
    
    clearSignature : function(component, event) {
        var $sigdiv = $("#signature");
        $sigdiv.jSignature("reset");
        component.set("v.isSigned", false);
        component.set("v.base64Image", null);
        
    }
})