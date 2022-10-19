sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, formatter, Filter, FilterOperator, JSONModel) {
    "use strict";

    return Controller.extend("project1.controller.ThirdPage", {
      formatter: formatter,

      /**
       * reads corresponding models out of URI via Template Strings
       * @param {} oEvent
       */
      _onObjectMatched: function (oEvent) {
        let path = oEvent.getParameter("arguments").results;
        let businessPartner = oEvent.getParameter("arguments").businessPartner;

        this.getView().bindElement({
          path: `/A_SalesOrder('${path}')`,
        });

        this.getOwnerComponent()
          .getModel("secondSource")
          .read(`/A_BusinessPartner('${businessPartner}')`, {
            urlParameters: {
              $expand: "to_BusinessPartnerAddress",
            },
            success: (data) => {
              this.getView().getModel("bpModel").setData(data);
            },
          });
      },

      /**
       * sets bound models to Third Page
       */
      onInit: function () {
        this.getView().setModel(new JSONModel(), "bpModel");
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("thirdPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      onNavBack: function (oEvent) {
        window.history.go(-1);
      },
    });
  }
);
