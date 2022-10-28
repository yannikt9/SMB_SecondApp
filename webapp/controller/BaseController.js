sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
  function (Controller, JSONModel) {
    return Controller.extend('project1.controller.BaseController', {
      /**
       * gets Model
       * @param {String} [sName]
       * @returns {Object} Data model
       */
      getModel(sName) {
        return (
          this.getView().getModel(sName) ||
          this.getOwnerComponent().getModel(sName)
        );
      },

      /**
       * sets Model
       * @param {Object} oModel
       * @param {String} sName
       */
      setModel(oModel, sName) {
        this.getView().setModel(oModel, sName);
      },

      /**
       * gets Router
       * @returns {Object} Router
       */
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      /**
       * creates shortcut for i18n resource bundle
       * @param {String} sString
       * @returns {String} text of i18n
       */
      getText: function (sString) {
        return this.getView().getModel('i18n').getResourceBundle().getText(sString);
      },

      /**
       * converts status into character
       * @param {String} sStatus
       * @returns statusString
       */
      convertStatus: function (sStatus) {
        switch (sStatus) {
          case this.getText('invoiceStatusA'):
            return 'A';
          case this.getText('invoiceStatusB'):
            return 'B';
          case this.getText('invoiceStatusC'):
            return 'C';
          default:
            return '';
        }
      },

      /**
       * if a start date has been selected, combines two values into a template String split 
       * by an exclamation mark for ease of separation at the second page to pass on in URI
       *
       * @param {Date} dStartDate
       * @param {Date} dEndDate
       * @returns {String} template String
       */
      convertDateRangeToTemplateString: function (dStartDate, dEndDate) {
        if (!dStartDate) {
          return '';
        }

        if (!dEndDate) {
          return '';
        }

        return `${dStartDate.getTime()}!${dEndDate.getTime()}`;
      },

      /**
       * creates model salesOrg using promise, due to asynchronized structure of JavaScript
       * @returns {Promise} salesOrg
       */
      createSalesOrgModel() {
        return new Promise((resolve, reject) => {
          this.getOwnerComponent()
            .getModel('org')
            .read('/A_SalesOrganization', {
              urlParameters: {
                $expand: 'to_Text',
              },
              success: (salesOrgs) => {
                const aSalesOrg  = salesOrgs.results
                  .map((element) => {
                    return element.to_Text.results.find(
                      (e) => e.Language === 'DE'
                    );
                  })
                  .filter((element) => element !== undefined);
                this.setModel(new JSONModel(aSalesOrg), 'salesOrg');

                resolve();
              },
              error: (oError) => {
                reject(oError);
              },
            });
        });
      },

      /**
       * gets model of sales organizations
       * @returns {Object} salesOrg
       */
      getSalesOrgModel() {
        return this.getModel('salesOrg').getData();
      },
    });
  }
);
