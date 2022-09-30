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

    formatSO(sOrganization) {
      let resourceBundle = this.getView().getModel("i18n").getResourceBundle();
      switch (sOrganization) {
        case "1010":
          return resourceBundle.getText("SO1");
        case "1710":
          return resourceBundle.getText("SO2");
        case "2099":
          return resourceBundle.getText("SO3");
        case "2040":
          return resourceBundle.getText("SO4");
        case "2060":
          return resourceBundle.getText("SO5");
        case "2050":
          return resourceBundle.getText("SO6");
        case "2020":
          return resourceBundle.getText("SO7");
        case "2030":
          return resourceBundle.getText("SO8");
        case "2010":
          return resourceBundle.getText("SO9");
      }
    },
  };
});
