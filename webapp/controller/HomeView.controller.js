sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/strings/formatMessage",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel,formatMessage) {
        "use strict";

        return Controller.extend("project1.controller.HomeView", {
            onInit: function () {
                let oSalesOfficeModel = new JSONModel("model/mockdata.json");
                this.getView().setModel(new JSONModel(), "display");
        
                oSalesOfficeModel.dataLoaded().then(() => {
                  let oData = oSalesOfficeModel.getData();
                  let setOfSalesOffices = new Set();
                  let arraySalesOffices = [];
        
                  oData.Orders.forEach((element) => {
                    setOfSalesOffices.add(element.SalesOffice);
                  });
        
                  /*  MODELNAME = display
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
                */
                  //[Arosa, Lenzerheide, Chur, St. Moriz, Laax, Davos]
                  setOfSalesOffices.forEach((element) => {
                    arraySalesOffices.push({
                      SalesOffice: element,
                      Statuses: [
                        {
                          status: "In Bearbeitung",
                          anzahl: oData.Orders.filter((e) => {
                            let condition1 = element === e.SalesOffice;
                            let condition2 =
                              "In Bearbeitung" === e.OverallDeliveryStatus;
                            return condition1 && condition2;
                          }).length,
                        },
                        {
                          status: "Ausgeführt",
                          anzahl: oData.Orders.filter((e) => {
                            let condition1 = element === e.SalesOffice;
                            let condition2 = "Ausgeführt" === e.OverallDeliveryStatus;
                            return condition1 && condition2;
                          }).length,
                        },
                        {
                          status: "Erfasst",
                          anzahl: oData.Orders.filter((e) => {
                            let condition1 = element === e.SalesOffice;
                            let condition2 = "Erfasst" === e.OverallDeliveryStatus;
                            return condition1 && condition2;
                          }).length,
                        },
                      ],
                    });
                  });
                  console.log(arraySalesOffices);
                  this.getView()
                    .getModel("display")
                    .setData({ stati: arraySalesOffices });
                });
        
                /* function sumArray(overallDeliveryStatus2010) {
                  let sum = 0;
                  overallDeliveryStatus2010.forEach(element => {
                    sum+= element;
                  });
                } */
              },
        
              onChartPressed: function (oEvent) {
                let oRouter = this.getOwnerComponent().getRouter();
        
                oRouter.navTo("secondPage", {
                  location: oEvent.getSource().getTitle(),
                });
              },
        });
    });
