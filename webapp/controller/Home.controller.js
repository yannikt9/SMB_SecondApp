sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "../model/formatter",
    "sap/ui/core/UIComponent",
    "sap/ui/core/BusyIndicator",
  ],
  function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    formatter,
    UIComponent,
    BusyIndicator
  ) {
    "use strict";

    return BaseController.extend("project1.controller.Home", {
      formatter: formatter,
      dStartDate: "",
      dEndDate: "",
      _sStatus: [],

      /**
       * empties private filtering Array _sStatus and clears selected statuses in viz Frame
       */
      _onRouteMatched: function () {
        this._sStatus = [];
        this.getView()
          .byId("idVizFrame")
          .vizSelection([], { clearSelection: true });
        console.log("viz frame prolly didn't refresh here");
      },

      /**
       * If a start date has been selected, converts start- and end-date into unitary template string to pass on in URL
       * @returns one template String with two values separated by an exclamation mark for ease of future separation
       */
      _dateRangeConvert: function () {
        if (this.dStartDate) {
          return `${this.dStartDate.getTime()}!${this.dEndDate.getTime()}`;
        }
        return "";
      },

      /**
       * Sets Data with applied Filters, sieves through data to create a set of all Sales Offices, passes "results" dataset
       * through Sales Office set and notes how many times each status has been called for in separate Array called "arraySalesOffices"
       * @param {sap.ui.model.Filter} [oFilter]
       */
      _setData: function (oFilter) {
        this.getOwnerComponent()
          .getModel()
          .read("/A_SalesOrder", {
            filters: [oFilter],
            success: (data) => {
              let setOfSalesOffices = new Set(
                data.results.map((element) => element.SalesOrganization)
              );
              let arraySalesOffices = [];
              if (data.results.length === 0) {
                return MessageBox.warning(
                  this.resources().getText("noOrdersInTimeSpan")
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

              setOfSalesOffices.forEach((element) => {
                arraySalesOffices.push({
                  SalesOffice: element,
                  Statuses: [
                    {
                      status: this.resources().getText("invoiceStatusA"),
                      quantity: data.results.filter((e) => {
                        let condition1 = element === e.SalesOrganization;
                        let condition2 = "A" === e.OverallDeliveryStatus;
                        return condition1 && condition2;
                      }).length,
                    },
                    {
                      status: this.resources().getText("invoiceStatusB"),
                      quantity: data.results.filter((e) => {
                        let condition1 = element === e.SalesOrganization;
                        let condition2 = "B" === e.OverallDeliveryStatus;
                        return condition1 && condition2;
                      }).length,
                    },
                    {
                      status: this.resources().getText("invoiceStatusC"),
                      quantity: data.results.filter((e) => {
                        let condition1 = element === e.SalesOrganization;
                        let condition2 = "C" === e.OverallDeliveryStatus;
                        return condition1 && condition2;
                      }).length,
                    },
                  ],
                });
                this.getView()
                  .getModel("display")
                  .setData({ stati: arraySalesOffices });
              });
              this.hideBusyIndicator();
            },
          });
      },

      /**
       * Sets model "display" and appeals to set Data function to fill it with appropriate data
       */
      onInit: function () {
        this.getRouter()
          .getRoute("home")
          .attachMatched(this._onRouteMatched, this);
        this.showBusyIndicator();
        this.getView().setModel(new JSONModel(), "display");
        this._setData();
      },

      /**
       * upon selection of start- and end-dates creates Filter to check whether SalesOrderDate is between selected two dates
       * @param {} oEvent
       * @returns without date range if start date has not been selected
       */
      onDateRangeSelect: function (oEvent) {
        this.dStartDate = oEvent.getSource().getDateValue();
        this.dEndDate = oEvent.getSource().getSecondDateValue();
        if (this.dStartDate === null) {
          this._setData(null);
        } else {
          this._setData(
            new Filter(
              "SalesOrderDate",
              FilterOperator.BT,
              this.dStartDate,
              this.dEndDate
            )
          );
        }
      },

      /**
       * upon selection of a status pushes it into private filtering Array sStatus
       */
      onSelectData: function (oEvent) {
        let status = oEvent.getParameter("data")[0].data.Status;
        if (!this._sStatus.includes(status)) {
          this._sStatus.push(status);
        }
        console.log(this._sStatus);
      },

      /**
       * deletes selected status from filter Array upon deselection
       * @param {} oEvent
       */
      onDeselectData: function (oEvent) {
        let status = oEvent.getParameter("data")[0].data.Status;
        this._sStatus = this._sStatus.filter((element) => element !== status);
      },

      /**
       * When chart header gets pressed, navigates to second Page and passes selected date range in URL as templatestring
       * @param {} oEvent
       */
      onChartPressed: function (oEvent) {
        let oRouter = this.getOwnerComponent().getRouter();

        oRouter.navTo("secondPage", {
          location: this.convertLocation(oEvent.getSource().getTitle()),
          dateRange: this._dateRangeConvert(),
          selectedStatus: this._sStatus.toString(),
        });
      },
      getRouter() {
        return UIComponent.getRouterFor(this);
      },

      hideBusyIndicator: function () {
        BusyIndicator.hide();
      },

      showBusyIndicator: function () {
        BusyIndicator.show(1000);
      },
    });
  }
);
