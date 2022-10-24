sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
  function (Controller, JSONModel) {
    return Controller.extend('project1.controller.BaseController', {
      resources: function () {
        return this.getView().getModel('i18n').getResourceBundle();
      },

      /**
       * converts locationNumbers into string and vice versa
       * @param {} sLocation
       * @returns locationNumber and locationString
       */

      getRouter: function () {
        return this.getOwnerComponent().getRouter();
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
       * If a start date has been selected, converts start- and end-date into unitary template string to pass on in URL
       * @returns one template String with two values separated by an exclamation mark for ease of future separation
       */
      dateRangeConvert: function (dStartDate, dEndDate) {
        if (dStartDate) {
          return `${dStartDate.getTime()}!${dEndDate.getTime()}`;
        }
        return '';
      },

      /**
       *
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

      createSOModel() {
        return new Promise((resolve, reject) => {
          this.getOwnerComponent()
            .getModel('thirdSource')
            .read('/A_SalesOrganization', {
              urlParameters: {
                $expand: 'to_Text',
              },
              success: (data) => {
                const aSO = [];
                data.results.forEach((element) => {
                  aSO.push(
                    element.to_Text.results.filter((e) => e.Language === 'DE')
                  );
                });
                const aTest = [];
                aSO
                  .filter((e) => e.length > 0)
                  .forEach((e) => {
                    aTest.push(e[0]);
                  });

                this._setModel(new JSONModel(aTest), 'soModel');

                resolve();
              },
              error: (oError) => {
                reject(oError);
              },
            });
        });
      },
      getSoModel() {
        return this._getModel('soModel').getData();
      },
    });
  }
);
