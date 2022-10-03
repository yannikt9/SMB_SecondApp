sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "../model/formatter",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    formatter
  ) {
    "use strict";

    return Controller.extend("project1.controller.Home", {
      formatter: formatter,
      dStartDate: "",
      dEndDate: "",
      _sStatus: [],

      /**
       * If a start date has been selected, converts start- and end-date into unitary template string to pass on in URL
       * @returns one template String with two values separated by an exclamation mark for ease of future separation
       */
      _dateRangeConvert: function () {
        if (this.dStartDate !== "") {
          return `${this.dStartDate}!${this.dEndDate}`;
        }
        return "";
      },

      /**
       * Sets Data with applied Filters, sieves through data to create a set of all Sales Offices, passes "results" dataset through Sales Office set and notes how many times each status has been called for in separate Array called "arraySalesOffices"
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
                  "In dieser Zeitspanne gab es keine Bestellungen"
                );
              }

              /* model name = results */
              /* {
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
                      status: "Erfasst",
                      quantity: data.results.filter((e) => {
                        let condition1 = element === e.SalesOrganization;
                        let condition2 = "A" === e.OverallDeliveryStatus;
                        return condition1 && condition2;
                      }).length,
                    },
                    {
                      status: "In Bearbeitung",
                      quantity: data.results.filter((e) => {
                        let condition1 = element === e.SalesOrganization;
                        let condition2 = "B" === e.OverallDeliveryStatus;
                        return condition1 && condition2;
                      }).length,
                    },
                    {
                      status: "Ausgeführt",
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
            },
          });
      },

      /**
       * Sets model "display" and appeals to set Data function to fill it with appropriate data
       */
      onInit: function () {
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
          return;
        }
        this._setData(
          new Filter(
            "SalesOrderDate",
            FilterOperator.BT,
            this.dStartDate,
            this.dEndDate
          )
        );
      },

      /**
       * upon selection of status pushes selected statuses in 
       */
      onSelectData: function (oEvent) {
        this._sStatus.push(oEvent.getParameter("data")[0].data.Status);
      },

      /**
       * When chart header gets pressed, navigates to second Page and passes selected date range in URL
       * @param {} oEvent
       */
      onChartPressed: function (oEvent) {
        let oRouter = this.getOwnerComponent().getRouter();

        oRouter.navTo("secondPage", {
          location: oEvent.getSource().getTitle(),
          dateRange: window.encodeURIComponent(this._dateRangeConvert()),
          selectedStatus: this._sStatus.toString(),
        });
      },
    });
  }
);
