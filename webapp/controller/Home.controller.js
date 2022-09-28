sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/FilterOperator",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, FilterOperator) {
    "use strict";

    return Controller.extend("project1.controller.Home", {
      /* MODELNAME = display
                  {
                    stati: [
                      {
                        standort: aaros,
                        statuses : [
                          {status: inBearbeitung, zahl: 7 }
                          {name: abgeschlossen, zahl: 7 }
                          {name: offen, zahl: 7 }
                        ]
                      },
                      {
                        standort: aaros,
                        statuses : [
                          {status: inBearbeitung, zahl: 7 }
                          {name: abgeschlossen, zahl: 7 }
                          {name: offen, zahl: 7 }
                        ]
                      } 
                    ]
                  }
                  [Arosa, Lenzerheide, Chur, St. Moriz, Laax, Davos] */
      onInit: function () {
        let oSalesOfficeModel = this.getOwnerComponent().getModel();
        this.getView().setModel(new JSONModel(), "display");
        oSalesOfficeModel.read("/A_SalesOrder", {
          success: (data) => {
            let setOfSalesOffices = new Set(
              data.results.map((element) => element.SalesOrganization)
            );
            let arraySalesOffices = [];
            console.log(data);

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
            console.log(setOfSalesOffices);
            
          },
        });

        

        /* this.getView().setModel(new JSONModel(), "display");
         */
      },

      onChartPressed: function (oEvent) {
        let oRouter = this.getOwnerComponent().getRouter();

        oRouter.navTo("secondPage", {
          location: oEvent.getSource().getTitle(),
        });
      },
    });
  }
);
