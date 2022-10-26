sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
  function (Controller, JSONModel) {
    return Controller.extend('project1.controller.BaseController', {

      /**
       * @param {String} [sName]
       * @returns
       */
       _getModel(sName) {
        return (
          this.getView().getModel(sName) ||
          this.getOwnerComponent().getModel(sName)
        );
      },

      _setModel(oModel, sName) {
        this.getView().setModel(oModel, sName);
      },

      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      /**
       * creates shortcut for i18n resource bundle
       * @returns i18n properties model
       */
      resources: function () {
        return this.getView().getModel('i18n').getResourceBundle();
      },

      /**
       * converts statusCharacter into string and vice versa
       * @param {} sStatus
       * @returns statusString
       */
      convertStatus: function (sStatus) {
        switch (sStatus) {
          case 'Erfasst':
            return 'A';
          case 'In Bearbeitung':
            return 'B';
          case 'Ausgeführt':
            return 'C';
          default:
            return '';
        }
      },

      /**
       * @param {any} dStartDate
       * @param {any} dEndDate
       * if a start date has been selected, combines both dates into template String to effectively pass on in URI
       * @returns single template String with two values separated by an exclamation mark for ease of separation in second page
       */
      dateRangeConvert: function (dStartDate, dEndDate) {
        if (dStartDate) {
          return `${dStartDate.getTime()}!${dEndDate.getTime()}`;
        }
        return '';
      },

      /**
       * creates model of sales organizations
       * @returns Promise of a model of sales organizations, due to asynchronized structure of JavaScript
       */
      createSalesOrganizationModel() {
        return new Promise((resolve, reject) => {
          this.getOwnerComponent()
            .getModel('thirdSource')
            .read('/A_SalesOrganization', {
              urlParameters: {
                $expand: 'to_Text',
              },
              success: (data) => {
                const aSalesOrg = [];
                data.results.forEach((element) => {
                  aSalesOrg.push(
                    element.to_Text.results.filter((e) => e.Language === 'DE')
                  );
                });
                const aSalesOrgFilter = [];
                aSalesOrg
                  .filter((element) => element.length > 0)
                  .forEach((element) => {
                    aSalesOrgFilter.push(element[0]);
                  });

                this._setModel(new JSONModel(aSalesOrgFilter), 'salesOrgModel');

                resolve();
              },
              error: (oError) => {
                reject(oError);
              },
            });
        });
      },

      getSalesOrganizationModel() {
        return this._getModel('salesOrgModel').getData();
      },
    });
  }
);
