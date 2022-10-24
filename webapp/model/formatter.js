sap.ui.define([], function () {
  return {
    formatDate(dOrderDate) {
      const dDate = new Date(dOrderDate);
      return dDate.toLocaleDateString();
    },

    statusText(sStatus) {
      /* const resourceBundle = this.getView().getModel('i18n').getResourceBundle(); */
      switch (sStatus) {
        case 'A':
          return this.resources().getText('invoiceStatusA');
        case 'B':
          return this.resources().getText('invoiceStatusB');
        case 'C':
          return this.resources().getText('invoiceStatusC');
        default:
          return this.resources().getText('invoiceStatusD');
        /* return resourceBundle.getText('invoiceStatusD'); */
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
