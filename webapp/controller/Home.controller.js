sap.ui.define(
  [
    './BaseController',
    'sap/m/MessageBox',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/core/BusyIndicator',
  ],
  function (
    BaseController,
    MessageBox,
    JSONModel,
    Filter,
    FilterOperator,
    BusyIndicator
  ) {
    return BaseController.extend('project1.controller.Home', {
      _dStartDate: undefined,
      _dEndDate: undefined,
      _aStatus: [],
      _aSalesOffices: [],

      /**
       * sets model "display", while it's loading, calls for busy indicator and appeals to private set data function to filter appropriately
       */
      onInit: function () {
        this.getRouter()
          .getRoute('home')
          .attachMatched(this.onRouteMatched, this);
        this.showBusyIndicator();
        this.getView().setModel(new JSONModel(), 'display');
        this.setData();
      },

      /**
       * empties private filtering array _aStatus
       */
      onRouteMatched: function () {
        this._aStatus = [];
      },

      /**
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
          this.setData(null);
        } else {
          this.setData(
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
      },

      /**
       * navigates to second page and passes parameters such as the location, array of selected statuses, and the selected date range (as template String) in URI
       * @param {} oEvent
       */
      onChartPressed: function (oEvent) {
        this.getRouter().navTo('secondPage', {
          location: oEvent.getSource().getSubtitle(),
          dateRange: this.convertDateRangeToTemplateString(
            this._dStartDate,
            this._dEndDate
          ),
          selectedStatus: this._aStatus.toString(),
        });
      },

      /**
       * creates an array of sales offices which is then used to sieve through all sales orders
       * and create a model with parameters such as the amount of times each status is represented
       * in the data for a given sales organization, as well as its name applies all filters
       * passes results into model "display"
       * @param {sap.ui.model.Filter} [oFilter]
       */
      setData: function (oFilter) {
        // TODO: Lesen der Sales Orders & Sales Orgs parallelisieren
        Promise.all([
          this.createSalesOrganizationModel(),
          this.getSalesOrders(oFilter),
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
              this.createSalesOrgModel().then(() => {
                const aSalesOffices = this.getSalesOrgModel().map((e) => ({
                  organization: e.SalesOrganization,
                  organizationName: e.SalesOrganizationName,
                }));

                aSalesOffices.forEach((element) => {
                  const oObject = {
                    SalesOfficeNumber: element.organization,
                    SalesOfficeName: element.organizationName,
                    // TODO: Redundanz für Quantity entfernen
                    Statuses: [
                      {
                        status: this.getText('invoiceStatusA'),
                        quantity: data.results.filter((e) => {
                          const condition1 =
                            element.organization === e.SalesOrganization;
                          const condition2 = e.OverallDeliveryStatus === 'A';
                          return condition1 && condition2;
                        }).length,
                      },
                      {
                        status: this.getText('invoiceStatusB'),
                        quantity: data.results.filter((e) => {
                          const condition1 =
                            element.organization === e.SalesOrganization;
                          const condition2 = e.OverallDeliveryStatus === 'B';
                          return condition1 && condition2;
                        }).length,
                      },
                      {
                        status: this.getText('invoiceStatusC'),
                        quantity: data.results.filter((e) => {
                          const condition1 =
                            element.organization === e.SalesOrganization;
                          const condition2 = e.OverallDeliveryStatus === 'C';
                          return condition1 && condition2;
                        }).length,
                      },
                    ],
                  };
                  this._aSalesOffices.push(oObject);
                });

                this.getView()
                  .getModel('display')
                  .setData({ offices: this._aSalesOffices });
                this.hideBusyIndicator();
              });
              this._aSalesOffices = [];
              if (data.results.length === 0) {
                MessageBox.warning(this.getText('noOrdersInTimeSpan'));
              }
            },
          });
      },

      /**
       * promises to create model
       * @param {} oFilter
       * @returns Promise
       */
      getSalesOrders: function (oFilter) {
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

      hideBusyIndicator: function () {
        BusyIndicator.hide();
        /* this.byId('grid').setBusy(false); */
      },

      showBusyIndicator: function () {
        BusyIndicator.show(1000);
        /* this.byId('grid').setBusy(true); */
      },
    });
  }
);
