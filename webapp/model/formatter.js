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
  };
});
