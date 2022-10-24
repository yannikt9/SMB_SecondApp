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
      _dStartDate: '',
      _dEndDate: '',
      _aStatus: [],
      _arraySalesOffices: [],

      /**
       * empties private filtering Array _aStatus and clears selected statuses in viz Frame
       */
      _onRouteMatched: function () {
        this._aStatus = [];
        this.getView()
          .byId('idVizFrame')
          .vizSelection([], { clearSelection: true });
      },

      /**
       * Sets Data with applied Filters, sieves through data to create a set of all Sales Offices, passes "results" dataset
       * through Sales Office set and notes how many times each status has been called for in separate Array called "arraySalesOffices"
       * @param {sap.ui.model.Filter} [oFilter]
       */
      _setData: function (oFilter) {
        this.getOwnerComponent()
          .getModel()
          .read('/A_SalesOrder', {
            filters: [oFilter],
            success: (data) => {
              this.createSOModel().then(() => {
                const aSalesOffices = this.getSoModel().map((e) => ({
                  org: e.SalesOrganization,
                  name: e.SalesOrganizationName,
                }));

                aSalesOffices.forEach((element) => {
                  this._arraySalesOffices.push({
                    SalesOfficeNumber: element.org,
                    SalesOfficeName: element.name,
                    Statuses: [
                      {
                        status: this.resources().getText('invoiceStatusA'),
                        quantity: data.results.filter((e) => {
                          const condition1 = element.org === e.SalesOrganization;
                          const condition2 = e.OverallDeliveryStatus === 'A';
                          return condition1 && condition2;
                        }).length,
                      },
                      {
                        status: this.resources().getText('invoiceStatusB'),
                        quantity: data.results.filter((e) => {
                          const condition1 = element.org === e.SalesOrganization;
                          const condition2 = e.OverallDeliveryStatus === 'B';
                          return condition1 && condition2;
                        }).length,
                      },
                      {
                        status: this.resources().getText('invoiceStatusC'),
                        quantity: data.results.filter((e) => {
                          const condition1 = element.org === e.SalesOrganization;
                          const condition2 = e.OverallDeliveryStatus === 'C';
                          return condition1 && condition2;
                        }).length,
                      },
                    ],
                  });
                  this.getView()
                    .getModel('display')
                    .setData({ offices: this._arraySalesOffices });
                });
                this._hideBusyIndicator();
              });
              this._arraySalesOffices = [];
              if (data.results.length === 0) {
                return MessageBox.warning(
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
              return "";
            },
          });
      },

      /**
       * Sets model "display" and appeals to set Data function to fill it with appropriate data
       */
      onInit: function () {
        this.getRouter()
          .getRoute('home')
          .attachMatched(this._onRouteMatched, this);
        this._showBusyIndicator();
        this.getView().setModel(new JSONModel(), 'display');
        this._setData();
      },

      /**
       * upon selection of start- and end-dates creates Filter to check whether SalesOrderDate is between selected two dates
       * @param {} oEvent
       * @returns without date range if start date has not been selected
       */
      onDateRangeSelect: function (oEvent) {
        this._dStartDate = new Date(oEvent.getSource().getDateValue());
        this._dEndDate = new Date(oEvent.getSource().getSecondDateValue());
        if (this._dStartDate === null) {
          this._setData(null);
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
       * upon selection of a status pushes it into private filtering Array sStatus
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
       * deletes selected status from filter Array upon deselection
       * @param {} oEvent
       */
      onDeselectData: function (oEvent) {
        const status = this.convertStatus(
          oEvent.getParameter('data')[0].data.Status
        );
        this._aStatus = this._aStatus.filter((element) => element !== status);
      },

      /**
       * When chart header gets pressed, navigates to second Page and passes selected date range in URL as templatestring
       * @param {} oEvent
       */
      onChartPressed: function (oEvent) {
        console.log(this.getView().byId('homePageCardTitle').getSubtitle());
        this.getRouter().navTo('secondPage', {
          location: oEvent.getSource().getSubtitle(),
          dateRange: this.dateRangeConvert(this._dStartDate, this._dEndDate),
          selectedStatus: this._aStatus.toString(),
        });
      },

      _hideBusyIndicator: function () {
        BusyIndicator.hide();
      },

      _showBusyIndicator: function () {
        BusyIndicator.show(1000);
      },
    });
  }
);
