/**
 * Created by tyler.mowbrey on 6/1/2017.
 */
({
    setupSignaturePad : function(component, event) {
        $(document).ready(function() {
            $("#signature").jSignature()
        });
    },

    submitSignature : function(component, event) {
        var $sigdiv = $("#signature");
        var datapair = $sigdiv.jSignature("getData", "svgbase64");
        component.find("outputText").set("v.value", datapair);
    },

    clearSignature : function(component, event) {
        var $sigdiv = $("#signature");
        $sigdiv.jSignature("reset");
    }
})