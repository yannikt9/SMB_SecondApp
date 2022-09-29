sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/ui/core/Fragment",
  ],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("project1.controller.ThirdPage", {
      getPage: function () {
        return this.byId("dynamicPageId");
      },
      onInit: function () {
        let oModel = this.getOwnerComponent().getModel();
        oModel.read("/A_SalesOrder", {});

        this.getView().setModel(
          new JSONModel({
            currency: "CHF",
          }),
          "view"
        );

        let oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("thirdPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: function (oEvent) {
        let path = window.decodeURIComponent(
          oEvent.getParameter("arguments").results
        );
        console.log(path);
        this.getView().bindElement({
          path: path,
          model: "results",
        });
      },
      toggleAreaPriority: function () {
        var oTitle = this.getPage().getTitle(),
          sNewPrimaryArea =
            oTitle.getPrimaryArea() === DynamicPageTitleArea.Begin
              ? DynamicPageTitleArea.Middle
              : DynamicPageTitleArea.Begin;
        oTitle.setPrimaryArea(sNewPrimaryArea);
      },
    });
  }
);
