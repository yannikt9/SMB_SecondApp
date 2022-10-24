sap.ui.define([], function () {
  return {
    formatDate(dOrderDate) {
      const dDate = new Date(dOrderDate);
      return dDate.toLocaleDateString();
    },

    statusText(sStatus) {
      const resourceBundle = this.getView().getModel('i18n').getResourceBundle();
      switch (sStatus) {
        case 'A':
          return resourceBundle.getText('invoiceStatusA');
        case 'B':
          return resourceBundle.getText('invoiceStatusB');
        case 'C':
          return resourceBundle.getText('invoiceStatusC');
        default:
          return resourceBundle.getText('invoiceStatusD');
      }
    },

    colorSetter(sStatus) {
      switch (sStatus) {
        case 'C':
          return 'Success';
        case 'A':
          return 'Warning';
        case 'B':
          return 'Information';
        default:
          return 'Error';
      }
    },
  };
});
