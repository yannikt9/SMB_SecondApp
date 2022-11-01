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
      _aSalesOffices : [],

      /**
       * sets model "display", while it's loading, calls for busy indicator and appeals to private set data function to filter appropriately
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
       * empties private filtering array _aStatus
       */
      _onRouteMatched: function () {
        this._aStatus = [];
      },

      /**
       * creates filter to display only the sales orders which are dated between the two selected dates
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
       * upon selecting a status pushes it into private filter array
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
       * deletes selected status from filter array upon deselection
       * @param {} oEvent
       */
      _onDeselectData: function (oEvent) {
        const status = this.convertStatus(
          oEvent.getParameter('data')[0].data.Status
        );
        this._aStatus = this._aStatus.filter((element) => element !== status);
      },

      /**
       * navigates to second page and passes parameters such as the location, array of selected statuses, and the selected date range (as template String) in URI
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
       * creates an array of sales offices which is then used to sieve through all sales orders
       * and create a model with parameters such as the amount of times each status is represented
       * in the data for a given sales organization, as well as its name applies all filters
       * passes results into model "display"
       * @param {sap.ui.model.Filter} [oFilter]
       */
      setData: function (oFilter) {
        Promise.all([
          this.createSalesOrgModel(),
          this._getSalesOrders(oFilter),
        ]).then((aValues) => {
          const [, aSalesOrders] = aValues;
          //aValues[0] = Resultat von createSalesOrganizationModel = undefined
          //aValues[1] = Resultat von __getSalesOrders
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
                const aLocations = [];
                aSalesOffices.forEach((element) => {
                  let iOrderCounter = 0;
                  const aStatuses = this.getOwnerComponent()
                    .getModel('status')
                    .getData()
                    .map((eStatus) => {
                      const iOrderLenght = data.results.filter(
                        (elm) =>
                          elm.SalesOrganization === element.organization &&
                          elm.OverallDeliveryStatus === eStatus.status
                      ).length;
                      iOrderCounter += iOrderLenght;
                      return {
                        status: eStatus.name,
                        quantity: iOrderLenght,
                      };
                    });
                  console.log(aStatuses);
                  if (iOrderCounter >= 1) {
                    aLocations.push({
                      SalesOfficeNumber: element.organization,
                      SalesOfficeName: element.organizationName,
                      Statuses: aStatuses,
                    });
                  }

                  /* const oObject = {
                     SalesOfficeNumber: element.organization,
                     SalesOfficeName: element.organizationName,
                     Statuses: [
                      {
                         status: this.filterStatuses(
                           element.status,
                           'A'
                           this.getText('invoiceStatusA')
                         ),
                         quantity: this.filterOrders(
                           data,
                           element.organization,
                          'A'
                         ),
                       },
                       
                   ],
                   };
                   console.log(this._aSalesOffices);
                   this._aSalesOffices.push(oObject); */

                });

                this.getView()
                  .getModel('display')
                  .setData({ offices: /* this._aSalesOffices */ aLocations });
                console.log(this.getView().getModel('display').getData());
                this._hideBusyIndicator();
              });
              /* this._aSalesOffices = []; */
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
        BusyIndicator.hide();
        /* this.byId('grid').setBusy(false); */
      },

      _showBusyIndicator: function () {
        BusyIndicator.show(1000);
        /* this.byId('grid').setBusy(true); */
      },
    });
  }
);
