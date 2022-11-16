sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/FilterOperator',
  ],
  function (Controller, JSONModel, FilterOperator) {
    return Controller.extend('project1.controller.BaseController', {
      /**
       * Convenience function which gets model
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
       * Convenience function which gets model
       * @param {Object} oModel
       * @param {String} sName
       */
      setModel(oModel, sName) {
        this.getView().setModel(oModel, sName);
      },

      /**
       * Convenience function which gets router
       * @returns {Object} router
       */
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      /**
       * Convenience function which gets i18n resource bundle
       * @param {String} sString
       * @returns {String} text from i18n
       */
      getText: function (sString) {
        return this.getView()
          .getModel('i18n')
          .getResourceBundle()
          .getText(sString);
      },

      /**
       * Converts status into character
       * @param {String} sStatus
       * @returns status String
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
       * If dates have been selected, combines two parameters into a template String to pass on in URI
       * Split by an exclamation mark for ease of separation at the second page
       *
       * @param {Date} dStartDate
       * @param {Date} dEndDate
       * @returns {String} template String
       */
      convertDateRangeToTemplateString: function (dStartDate, dEndDate) {
        if (!dStartDate || !dEndDate) {
          return '';
        }
        const startDate = new Date(dStartDate);
        const endDate = new Date(dEndDate);
        return `${startDate.getTime()}!${endDate.getTime()}`;
      },

      /**
       * Creates model salesOrg using promise to avoid problems with asynchronous buildup
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
                const aSalesOrg = salesOrgs.results
                  .map((element) =>
                    element.to_Text.results.find((e) => e.Language === 'DE')
                  )
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
       * Convenience function which gets model of sales organizations
       * @returns {Object} salesOrg
       */
      getSalesOrgModel() {
        return this.getModel('salesOrg').getData();
      },

      createFilterModel() {
        this.setModel(
          new JSONModel({
            selectedStatus: {
              path: 'OverallDeliveryStatus',
              operator: FilterOperator.EQ,
              value1: null,
              value2: null,
            },
            location: {
              path: 'SalesOrganization',
              operator: FilterOperator.EQ,
              value1: null,
              value2: null,
            },
            dateRange: {
              path: 'SalesOrderDate',
              operator: FilterOperator.BT,
              value1: null,
              value2: null,
            },
          }),
          'filter'
        );
      },

      /**
       * Convenience function which gets filter model
       * @returns {Object} 'filter'
       */
      getFilterModel() {
        return this.getModel('filter').getData();
      },
    });
  }
);
