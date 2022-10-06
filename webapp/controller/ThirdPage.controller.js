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
      _sResults: "",

      /**
       * decodes passed over Sales Order
       * @param {} oEvent
       */
      _onObjectMatched: function (oEvent) {
        let oArgs = oEvent.getParameter("arguments");
        let path = window.decodeURIComponent(oArgs.results);
        let businessPartner = oEvent.getParameter("arguments").businessPartner;
        this._sResults = path;
        this.getView().bindElement({
          path: path,
        });
        this.getView().setModel(new JSONModel(), "bpModel");
        this.getOwnerComponent()
          .getModel("secondSource")
          .read("/A_BusinessPartner", {
            urlParameters: {
              $expand: "to_BusinessPartnerAddress",
            },
            filters: [
              new Filter("BusinessPartner", FilterOperator.EQ, businessPartner),
            ],
            success: (data) => {
              console.log(data.results[0]);
              this.getView().getModel("bpModel").setData(data.results[0]);
            },
          });
      },

      /**
       * attaches decoded passed over Sales Order to third page
       */
      onInit: function () {
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("thirdPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      /**
       * gets page
       * @returns page by ID
       */
      getPage: function () {
        return this.byId("dynamicPageId");
      },

      /**
       * sets title
       */
      toggleAreaPriority: function () {
        let oTitle = this.getPage().getTitle(),
          sNewPrimaryArea =
            oTitle.getPrimaryArea() === DynamicPageTitleArea.Begin
              ? DynamicPageTitleArea.Middle
              : DynamicPageTitleArea.Begin;
        oTitle.setPrimaryArea(sNewPrimaryArea);
      },

      onNavBack: function (oEvent) {
        window.history(-1);
      },
    });
  }
);
