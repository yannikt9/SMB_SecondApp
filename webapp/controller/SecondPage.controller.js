sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "../model/formatter",
  ],
  function (
    Controller,
    JSONModel,
    MessageToast,
    Filter,
    FilterOperator,
    FilterType,
    formatter
  ) {
    "use strict";

    return Controller.extend("project1.controller.SecondPage", {
      formatter: formatter,
      _sLocation: "",
      _sStatus: "",
      _dSelectedDate: "",
      _dSelectedSecondDate: "",

      _convertStatus: function (sStatus) {
        switch (sStatus) {
          case "Ausgeführt":
            return "A";
          case "Erfasst":
            return "B";
          case "In Bearbeitung":
            return "C";
        }
      },
      onInit: function () {
        // set explored app's demo model on this sample
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
          .getRoute("secondPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: function (oEvent) {
        let location = oEvent.getParameter("arguments").location;
        this.getView().byId("secondPageTitle").setText(location);
        this._sLocation = location;
        this._applyFilters();
      },
      onStatusChanged: function (oEvent) {
        let oComboBox = this.byId("idSelectStatus");
        let chosenKey = oComboBox.getSelectedKey();

        this._sStatus = chosenKey;
        this._applyFilters();
      },
      onDateChanged: function (oEvent) {
        this._dSelectedDate = oEvent.getSource().getDateValue();
        this._dSelectedSecondDate = oEvent.getSource().getSecondDateValue();
        this._applyFilters();
      },
      onPaste: function (oEvent) {
        var aData = oEvent.getParameter("data");
        MessageToast.show("Pasted Data: " + aData);
      },

      onRowPressed: function (oEvent) {
        let oItem = oEvent.getSource().getBindingContext().getPath();
        console.log(oItem);
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("thirdPage", {
          orders: window.encodeURIComponent(oItem),
        });
      },

      _applyFilters() {
        let aFilters = [];
        if (this._sLocation) {
          aFilters.push(
            new Filter(
              "SalesOrganization",
              FilterOperator.Contains,
              this._sLocation
            )
          );
        }
        if (this._sStatus) {
          aFilters.push(
            new Filter(
              "OverallDeliveryStatus",
              FilterOperator.Contains,
              this._convertStatus(this._sStatus)
            )
          );
        }
        if (this._dSelectedSecondDate && this._dSelectedDate) {
          aFilters.push(
            new Filter(
              "SalesOrderDate",
              FilterOperator.BT,
              this._dSelectedDate,
              this._dSelectedSecondDate
            )
          );
        }
        this.getView()
          .byId("orderTable")
          .getBinding("items")
          .filter(aFilters, FilterType.Application);
      },
    });
  }
);
