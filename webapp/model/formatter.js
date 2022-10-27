sap.ui.define([], function () {
  return {
    /**
     * formats Date to local date String
     * @param {Date} dOrderDate 
     * @returns Local Date String
     */
    formatDate(dOrderDate) {
      const dDate = new Date(dOrderDate);
      return dDate.toLocaleDateString();
    },

    statusText(sStatus) {
      switch (sStatus) {
        case 'A':
          return this.getText('invoiceStatusA');
        case 'B':
          return this.getText('invoiceStatusB');
        case 'C':
          return this.getText('invoiceStatusC');
        default:
          return this.getText('invoiceStatusD');
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
