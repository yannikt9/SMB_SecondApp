sap.ui.define(
  [
    './BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/MessageBox',
    'sap/ui/core/BusyIndicator',
  ],
  function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    BusyIndicator
  ) {
    return BaseController.extend('project1.controller.Home', {
      _dStartDate: '', // TODO: Mit undefined initialisieren
      _dEndDate: '',
      _aStatus: [],
      _aSalesOffices: [],

      /**
       * empties private filtering Array _aStatus
       */
      _onRouteMatched: function () {
        this._aStatus = [];
      },

      /**
       * creates an array of sales offices which is then used to sieve through all sales orders
       * and create a model with parameters such as
       * the amount of times each status is represented in the data for a given sales organization,
       * as well as its name
       * applies all filters
       * passes results into model "display"
       * @param {sap.ui.model.Filter} [oFilter]
       */
      _setData: function (oFilter) {
        // TODO: Lesen der Sales Orders & Sales Orgs parallelisieren
        Promise.all([
          this.createSalesOrganizationModel(),
          this._getSalesOrders(oFilter),
        ]).then((aValues) => {
          const [, aSalesOrders] = aValues;


          //aValues[0] = Resultat von createSalesOrganizationModel = undefined
          //aValues[1] = Resultat von _getSalesOrders
        });

        this.getOwnerComponent()
          .getModel()
          .read('/A_SalesOrder', {
            filters: [oFilter],
            success: (data) => {
              // TODO: Private Property _aSalesOffices unnötigt --> Lokale Variable

              this.createSalesOrganizationModel().then(() => {
                const aSalesOffices = this.getSalesOrganizationModel().map(
                  (e) => ({
                    organization: e.SalesOrganization,
                    organizationName: e.SalesOrganizationName,
                  })
                );

                aSalesOffices.forEach((element) => {
                  const oObject = {
                    SalesOfficeNumber: element.organization,
                    SalesOfficeName: element.organizationName,
                    // TODO: Redundanz für Quantity entfernen
                    Statuses: [
                      {
                        status: this.resources().getText('invoiceStatusA'),
                        quantity: data.results.filter((e) => {
                          const condition1 =
                            element.organization === e.SalesOrganization;
                          const condition2 = e.OverallDeliveryStatus === 'A';
                          return condition1 && condition2;
                        }).length,
                      },
                      {
                        status: this.resources().getText('invoiceStatusB'),
                        quantity: data.results.filter((e) => {
                          const condition1 =
                            element.organization === e.SalesOrganization;
                          const condition2 = e.OverallDeliveryStatus === 'B';
                          return condition1 && condition2;
                        }).length,
                      },
                      {
                        status: this.resources().getText('invoiceStatusC'),
                        quantity: data.results.filter((e) => {
                          const condition1 =
                            element.organization === e.SalesOrganization;
                          const condition2 = e.OverallDeliveryStatus === 'C';
                          return condition1 && condition2;
                        }).length,
                      },
                    ],
                  };

                  // TODO: Prüfen, ob relevant und erst dann Push

                  this._aSalesOffices.push(oObject);
                });

                // TODO: Bereinigung am Ende üer gesamte Sales Offices mit einem Statement
                // const orderCount = this._aSalesOffices
                //   .find((elm) => elm.SalesOfficeNumber === element.organization)
                //   .Statuses.filter((count) => count.quantity >= 1).length;
                // if (orderCount < 1) {
                //   this._aSalesOffices = this._aSalesOffices.filter(
                //     (e) => e.SalesOfficeNumber !== element.organization
                //   );
                // }

                this.getView()
                  .getModel('display')
                  .setData({ offices: this._aSalesOffices });
                this._hideBusyIndicator();
              });
              this._aSalesOffices = [];
              if (data.results.length === 0) {
                MessageBox.warning(
                  this.resources().getText('noOrdersInTimeSpan')
                );
              }

              /* model name = results
              {
                stati: [
                  {
                    standort: Arosa,
                    statuses : [
                      {status: "Erfasst", quantity: 7}
                      {status: "In Bearbeitung", quantity: 7}
                      {status: "Ausgeführt", quantity: 7}
                    ]
                  },
                ]
              } */
            },
          });
      },

      _getSalesOrders: function (oFilter) {
        return new Promise((resolve, reject) => {
          this.getOwnerComponent()
            .getModel()
            .read('/A_SalesOrder', {
              filters: [oFilter],
              success: (data) => {
                resolve(data.results);
              },
              error: (error) => {
                reject(error);
              },
            });
        });
      },

      _hideBusyIndicator: function () {
        this.byId('grid').setBusy(false);
      },

      _showBusyIndicator: function () {
        // TODO: Model aktualisieren, statt Grid direkt
        this.byId('grid').setBusy(true);
      },

      /**
       * sets model "display", while it's loading, calls for busy indicator and appeals to private set data function to filter appropriately
       */
      onInit: function () {
        this.getRouter()
          .getRoute('home')
          .attachMatched(this._onRouteMatched, this);
        this._showBusyIndicator();
        this.getView().setModel(new JSONModel(), 'display');

        // TODO: Evtl. Auslagerung des Busy Indicators in eigenes JSON Model. Binding
        // des Grids in der View XML.
        this.getView().setModel(
          new JSONModel({
            gridBusy: false,
          }),
          'uiControl'
        );

        this._setData();
      },

      /**
       *
       * creates filter to display only the sales orders which are dated between the two selected dates
       * @param {} oEvent
       */
      onDateRangeSelect: function (oEvent) {
        const oSource = oEvent.getSource();

        this._dStartDate = oSource.getDateValue()
          ? new Date(oSource.getDateValue())
          : null;
        this._dEndDate = oSource.getSecondDateValue()
          ? new Date(oSource.getSecondDateValue())
          : null;
        if (!this._dStartDate) {
          this._setData();
        } else {
          this._setData(
            new Filter(
              'SalesOrderDate',
              FilterOperator.BT,
              this._dStartDate,
              this._dEndDate
            )
          );
        }
      },

      /**
       * upon selecting a status pushes it into private filter array
       */
      onSelectData: function (oEvent) {
        const status = this.convertStatus(
          oEvent.getParameter('data')[0].data.Status
        );
        if (!this._aStatus.includes(status)) {
          this._aStatus.push(status);
        }
      },

      /**
       * deletes selected status from filter array upon deselection
       * @param {} oEvent
       */
      onDeselectData: function (oEvent) {
        const status = this.convertStatus(
          oEvent.getParameter('data')[0].data.Status
        );
        this._aStatus = this._aStatus.filter((element) => element !== status);

        // const iIndex = this._aStatus.findIndex((element) => element === status);
        // if (iIndex >= 0) {
        //   this._aStatus.splice(iIndex, 1);
        // }
      },

      /**
       * navigates to second page and passes parameters such as the location, array of selected statuses, and the selected date range (as template String) in URI
       * @param {} oEvent
       */
      onChartPressed: function (oEvent) {
        this.getRouter().navTo('secondPage', {
          location: oEvent.getSource().getSubtitle(),
          dateRange: this.dateRangeConvert(this._dStartDate, this._dEndDate),
          selectedStatus: this._aStatus.toString(),
        });
      },
    });
  }
);
