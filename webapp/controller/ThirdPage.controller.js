sap.ui.define(
  ["sap/ui/core/mvc/Controller", "../model/formatter"],
  function (Controller, formatter) {
    "use strict";

    return Controller.extend("project1.controller.ThirdPage", {
      formatter: formatter,
      _sResults: "",

      _onObjectMatched: function (oEvent) {
        let path = window.decodeURIComponent(
          oEvent.getParameter("arguments").results
        );
        this._sResults = path;
        this.getView().bindElement({
          path: path,
        });
        console.log(path);
      },

      onInit: function () {
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("thirdPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      getPage: function () {
        return this.byId("dynamicPageId");
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
