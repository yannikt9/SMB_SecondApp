sap.ui.define([], function () {
  "use strict";

  return {
    formatDate (dOrderDate){
        return dOrderDate.toLocaleDateString();
    },

    statusText (sStatus){
      let resourceBundle = this.getView().getModel("i18n").getResourceBundle();
      switch(sStatus){
        case "A":
          return resource
      }
    }
  };
});
