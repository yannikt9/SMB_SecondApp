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

      /**
       * Sets model "display", while it's loading, shows global busy indicator and
       * Appeals to private "set data" function to filter appropriately
       */
      onInit: function () {
        this.getRouter()
          .getRoute('home')
          .attachMatched(this._onRouteMatched, this);
        this._showBusyIndicator();
        this.getView().setModel(new JSONModel(), 'display');
        this.setData();
      },

      /**
       * Empties private filtering array _aStatus
       */
      _onRouteMatched: function () {
        this._aStatus = [];
      },

      /**
       * Creates filter to only display sales orders which set between the two selected dates
       * @param {} oEvent
       */
      _onDateRangeSelect: function (oEvent) {
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
       * Upon selection of a status pushes it into private filter array
       */
      _onSelectData: function (oEvent) {
        const status = this.convertStatus(
          oEvent.getParameter('data')[0].data.Status
        );
        if (!this._aStatus.includes(status)) {
          this._aStatus.push(status);
        }
      },

      /**
       * Upon deselection of a status pushes deletes it into private filter array
       * @param {} oEvent
       */
      _onDeselectData: function (oEvent) {
        const status = this.convertStatus(
          oEvent.getParameter('data')[0].data.Status
        );
        this._aStatus = this._aStatus.filter((element) => element !== status);
      },

      /**
       * Event handler that navigates to second page,
       * Passes parameters location, array of selected statuses, and the selected date range in URI
       * @param {} oEvent
       */
      _onChartPressed: function (oEvent) {
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
       * Promises to get all data models
       * Creates an array of sales offices
       * Loops through data and dynamically creates a map of statuses and the amount of times each one is represented 
       * Passes results into model "display"
       * 
       * @param {sap.ui.model.Filter} [oFilter]
       */
      setData: function (oFilter) {
        Promise.all([
          this.createSalesOrgModel(),
          this._getSalesOrders(oFilter),
        ]).then((aValues) => {
          const [, aSalesOrders] = aValues;
          //aValues[0] = Result of createSalesOrgModel = undefined
          //aValues[1] = Result of _getSalesOrders
        });

        this.getOwnerComponent()
          .getModel()
          .read('/A_SalesOrder', {
            filters: [oFilter],
            success: (data) => {
              this.createSalesOrgModel().then(() => {
                const aSalesOffices = this.getSalesOrgModel().map((e) => ({
                  org: e.SalesOrganization,
                  orgName: e.SalesOrganizationName,
                }));
                const aLocations = [];
                aSalesOffices.forEach((element) => {
                  let iOrderCounter = 0;
                  const aStatuses = this.getOwnerComponent()
                    .getModel('status')
                    .getData()
                    .map((eStatus) => {
                      const iOrderLength = data.results.filter(
                        (elm) =>
                          elm.SalesOrganization === element.org &&
                          elm.OverallDeliveryStatus === eStatus.status
                      ).length;
                      iOrderCounter += iOrderLength;
                      return {
                        status: eStatus.name,
                        quantity: iOrderLength,
                      };
                    });
                  if (iOrderCounter >= 1) {
                    aLocations.push({
                      SalesOfficeNumber: element.org,
                      SalesOfficeName: element.orgName,
                      Statuses: aStatuses,
                    });
                  }
                });
                this.getView()
                  .getModel('display')
                  .setData({ offices: aLocations });
                this._hideBusyIndicator();
              });
              if (data.results.length === 0) {
                MessageBox.warning(this.getText('noOrdersInTimeSpan'));
                return;
              }
            },
          });
      },

      /**
       * Promises to create model
       * @param {} oFilter
       * @returns Promise
       */
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

      /**
       * Global busy indicator, is a separate function for ease of future deployment in grids
       */
      _showBusyIndicator: function () {
        BusyIndicator.show(1000);
        /* this.byId('grid').setBusy(true); */
      },

      _hideBusyIndicator: function () {
        BusyIndicator.hide();
        /* this.byId('grid').setBusy(false); */
      },
    });
  }
);
