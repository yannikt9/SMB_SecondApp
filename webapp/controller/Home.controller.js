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

      _dateRangeConvert: function () {
        if (this.dStartDate !== "") {
          return `${this.dStartDate}!${this.dEndDate}`;
        }
        return "";
      },

      /**
       *
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
              console.log(data);
              /* MODELNAME = results
                  {
                    stati: [
                      {
                        standort: Arosa,
                        statuses : [
                          {status: inBearbeitung, anzahl: 7 }
                          {status: abgeschlossen, anzahl: 7 }
                          {status: offen, anzahl: 7 }
                        ]
                      },
                    ]
                  }
                  [Arosa, Lenzerheide, Chur, St. Moriz, Laax, Davos] */
              setOfSalesOffices.forEach((element) => {
                arraySalesOffices.push({
                  SalesOffice: element,
                  Statuses: [
                    {
                      status: "Erfasst",
                      anzahl: data.results.filter((e) => {
                        let condition1 = element === e.SalesOrganization;
                        let condition2 = "A" === e.OverallDeliveryStatus;
                        return condition1 && condition2;
                      }).length,
                    },
                    {
                      status: "In Bearbeitung",
                      anzahl: data.results.filter((e) => {
                        let condition1 = element === e.SalesOrganization;
                        let condition2 = "B" === e.OverallDeliveryStatus;
                        return condition1 && condition2;
                      }).length,
                    },
                    {
                      status: "Ausgeführt",
                      anzahl: data.results.filter((e) => {
                        let condition1 = element === e.SalesOrganization;
                        let condition2 = "C" === e.OverallDeliveryStatus;
                        return condition1 && condition2;
                      }).length,
                    },
                  ],
                });
                console.log(arraySalesOffices);
                this.getView()
                  .getModel("display")
                  .setData({ stati: arraySalesOffices });
              });
            },
          });
      },
      onInit: function () {
        this.getView().setModel(new JSONModel(), "display");
        this._setData();
      },

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

      onChartPressed: function (oEvent) {
        let oRouter = this.getOwnerComponent().getRouter();

        oRouter.navTo("secondPage", {
          location: oEvent.getSource().getTitle(),
          dateRange: window.encodeURIComponent(
            this._dateRangeConvert(),
          ),
        });
      },
    });
  }
);
