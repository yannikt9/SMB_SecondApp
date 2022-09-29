sap.ui.define(
  ["sap/ui/core/mvc/Controller", "../model/formatter"],
  function (Controller, formatter) {
    "use strict";

    return Controller.extend("project1.controller.ThirdPage", {
		formatter: formatter,
		_sResults: "",

      getPage: function () {
        return this.byId("dynamicPageId");
      },
      onInit: function () {
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("thirdPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },
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
