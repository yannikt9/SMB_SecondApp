sap.ui.define([
	"sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    "sap/base/util/UriParameters",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/core/format/NumberFormat",
], function(
	Log,
    Controller,
    JSONModel,
    MessageToast,
    DateFormat,
    Filter,
    UriParameters,
    FilterOperator,
    FilterType,
    NumberFormat,
) {
	"use strict";

	return Controller.extend("project1.controller.SecondPage", {
        _sLocation: "",
      _sStatus: "",

      _onObjectMatched: function (oEvent) {
        let location = oEvent.getParameter("arguments").location;
        this.getView().byId("secondPageTitle").setText(location);
        let oView = this.getView();

        this._sLocation = location;

        this._applyFilters();
      },
      onInit: function () {
        // set explored app's demo model on this sample
        var oJSONModel = new JSONModel("model/mockdata.json");
        this.getView().setModel(oJSONModel, "orders");
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("secondPage")
          .attachMatched(this._onObjectMatched, this);

          this.getView().setModel(
            new JSONModel({
              currency: "CHF",
            }),
            "view"
          );
      },

      onPaste: function (oEvent) {
        var aData = oEvent.getParameter("data");
        MessageToast.show("Pasted Data: " + aData);
      },

      onStatusChanged: function (oEvent) {
        let oTable = this.byId("orderTable");
        let oComboBox = this.byId("idSelectStatus");
        let chosenKey = oComboBox.getSelectedKey();
        console.log(chosenKey);
        let oView = this.getView();

        this._sStatus = chosenKey;

        this._applyFilters();
      },

      onRowPressed: function (oEvent) {
        let oItem = oEvent.getSource().getBindingContext("orders").getPath();
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("thirdPage", {
          orders: window.encodeURIComponent(oItem),
        });
      },

      _applyFilters() {
        const aFilters = [];

        if (this._sLocation) {
          aFilters.push(
            new Filter("SalesOffice", FilterOperator.EQ, this._sLocation)
          );
        }

        if (this._sStatus) {
          aFilters.push(
            new Filter(
              "OverallDeliveryStatus",
              FilterOperator.EQ,
              this._sStatus
            )
          );
        }
        this.getView()
          .byId("orderTable")
          .getBinding("items")
          .filter(aFilters, FilterType.Application);
      },
	});
});