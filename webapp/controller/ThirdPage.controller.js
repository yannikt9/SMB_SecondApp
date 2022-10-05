sap.ui.define(
  ["sap/ui/core/mvc/Controller", "../model/formatter"],
  function (Controller, formatter) {
    "use strict";

    return Controller.extend("project1.controller.ThirdPage", {
      formatter: formatter,
      _sResults: "",

      /**
       * decodes passed over Sales Order
       * @param {} oEvent 
       */
      _onObjectMatched: function (oEvent) {
        let path = window.decodeURIComponent(
          oEvent.getParameter("arguments").results
        );
        this._sResults = path;
        this.getView().bindElement({
          path: path,
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
    });
  }
);
