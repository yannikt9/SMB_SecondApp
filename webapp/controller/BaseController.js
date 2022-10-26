sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
  function (Controller, JSONModel) {
    return Controller.extend('project1.controller.BaseController', {
      /**
       * fadsffsaf fdsafas fsdafadsfasfasf fdsfas fdafsa
       * fasdfadsfsfsfa fsadfsdafdsafasdfs fsdafsdafad
       * sfdsafsfdasfasd
       *
       * @param {String} [sName]
       * @returns {object} Data model
       */
      _getModel(sName = undefined) {
        return (
          this.getView().getModel(sName) ||
          this.getOwnerComponent().getModel(sName)
        );
      },

      _setModel(oModel, sName = undefined) {
        this.getView().setModel(oModel, sName);
      },

      // TODO: Einheitlichkeit betreffend Public/Private
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      /**
       * creates shortcut for i18n resource bundle
       * @returns i18n properties model
       */
      // TODO: getRessources()
      // TODO: Noch besser  -> Gleich getText()...
      resources: function () {
        return this.getView().getModel('i18n').getResourceBundle();
      },

      /**
       * converts statusCharacter into string and vice versa
       * @param {} sStatus
       * @returns statusString
       */
      // TODO: Evtl. Auslagerung der Status als Array von Objekten ({key: 'A', text: 'Erfasst'})
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
       * if a start date has been selected, combines both dates into template String to effectively pass on in URI
       *
       * @param {Date} dStartDate
       * @param {Date} dEndDate
       *
       * @returns single template String with two values separated by an exclamation mark for ease of separation in second page
       */

      // TODO: Beschreibung Return Parameter als übergeordnete Beschreibung
      // TODO: Methoden Namen verbessern convertDateRange[To?]

      dateRangeConvert: function (dStartDate, dEndDate) {
        // if (dStartDate) {
        //   return `${dStartDate.getTime()}!${dEndDate.getTime()}`;
        // }
        // return '';

        // TODO: Reihenfolge mit Validierung

        if (!dStartDate) {
          return '';
        }

        if (!dEndDate) {
          return '';
        }

        return `${dStartDate.getTime()}!${dEndDate.getTime()}`;
      },

      /**
       * creates model of sales organizations
       * @returns Promise of a model of sales organizations, due to asynchronized structure of JavaScript
       */
      createSalesOrganizationModel() {
        return new Promise((resolve, reject) => {
          this.getOwnerComponent()
            .getModel('thirdSource') // TODO: Modelnamen in Manifest sinnvoll wählen
            .read('/A_SalesOrganization', {
              urlParameters: {
                $expand: 'to_Text',
              },
              success: (data) => {
                // Evtl. Hungarian Notation
                const aSalesOrg = [];
                // data.results.forEach((element) => {
                //   aSalesOrg.push(
                //     element.to_Text.results.filter((e) => e.Language === 'DE')
                //   );
                // });

                // data.results.forEach((element) => {
                //   const oOrg = element.to_Text.results.find((e) => e.Language === 'DE');
                //   if (oOrg) {
                //     aSalesOrg.push(oOrg);
                //   }
                // });

                // const aSalesOrgFilter = [];
                // aSalesOrg
                //   .filter((element) => element.length > 0)
                //   .forEach((element) => {
                //     aSalesOrgFilter.push(element[0]);
                //   });

                aSalesOrg = data.results
                  .map((element) => {
                    return element.to_Text.results.find(
                      (e) => e.Language === 'DE'
                    );
                  })
                  .filter((element) => element !== undefined);

                this._setModel(new JSONModel(aSalesOrg), 'salesOrgModel'); // TODO: Model nicht notwendig

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
