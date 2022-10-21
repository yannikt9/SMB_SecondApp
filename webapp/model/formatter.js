sap.ui.define([], function () {
  "use strict";

  return {
    formatDate(dOrderDate) {
      let dDate = new Date(dOrderDate);
      return dDate.toLocaleDateString();
    },

    statusText(sStatus) {
      let resourceBundle = this.getView().getModel("i18n").getResourceBundle();
      switch (sStatus) {
        case "A":
          return resourceBundle.getText("invoiceStatusA");
        case "B":
          return resourceBundle.getText("invoiceStatusB");
        case "C":
          return resourceBundle.getText("invoiceStatusC");
        default:
          return "Offen";
      }
    },
    
    colorSetter(sStatus) {
      switch (sStatus) {
        case "C":
          return "Success";
        case "A":
          return "Warning";
        case "B":
          return "Information";
        default:
          return "Error";
      }
    },
  };
});
