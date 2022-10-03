sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "../model/formatter",
  ],
  function (
    Controller,
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
      _sStatus: [],
      _dSelectedDate: "",
      _dSelectedSecondDate: "",
      _aFilters: [],

      _convertStatus: function (sStatus) {
        switch (sStatus) {
          case "Erfasst":
            return "A";
          case "In Bearbeitung":
            return "B";
          case "Ausgeführt":
            return "C";
        }
      },

      _convertLocation(sLocation) {
        switch (sLocation) {
          case "InlandVerkOrg. DE":
            return "1010";
          case "InlandVerkOrg. US":
            return "1710";
          case "St. Moritz":
            return "2010";
          case "Arosa":
            return "2020";
          case "Laax":
            return "2030";
          case "Davos":
            return "2040";
          case "Chur":
            return "2050";
          case "Lenzerheide":
            return "2060";
          case "Interlaken":
            return "2099";
        }
      },
      onInit: function () {
        // set explored app's demo model on this sample

        let oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("secondPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: function (oEvent) {
        let location = oEvent.getParameter("arguments").location;
        let dateRange = window.decodeURIComponent(
          oEvent.getParameter("arguments").dateRange
        );
        this._sStatus = oEvent
          .getParameter("arguments")
          .selectedStatus.split(",");

        this._dSelectedDate = dateRange.split("!")[0];
        this._dSelectedSecondDate = dateRange.split("!")[1];
        /* let [this._dSelectedDate, this._dSelectedSecondDate ...rest] = dateRange.split("!");*/

        this.getView().byId("secondPageTitle").setText(location);
        this._sLocation = this._convertLocation(location);
        this._applyFilters();

      },
      handleSelectionChange: function (oEvent) {
        this._sStatus = oEvent.getSource().getSelectedKeys();
      },
      handleSelectionFinish: function () {
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
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("thirdPage", {
          results: window.encodeURIComponent(oItem),
        });
      },

      _applyFilters() {
        this._aFilters = [];
        if (this._sLocation) {
          this._aFilters.push(
            new Filter(
              "SalesOrganization",
              FilterOperator.Contains,
              this._sLocation
            )
          );
        }
        if (this._sStatus.length !== 0) {
          this._sStatus.forEach((element) => {
            this._aFilters.push(
              new Filter(
                "OverallDeliveryStatus",
                FilterOperator.Contains,
                this._convertStatus(element)
              )
            );
          });
        }
        if (this._dSelectedSecondDate && this._dSelectedDate) {
          this._aFilters.push(
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
          .filter(this._aFilters, FilterType.Application);
      },

      deleteButtonPressed: function () {
        this._aFilters = [];
        this.getView()
          .byId("orderTable")
          .getBinding("items")
          .filter(this._aFilters, FilterType.Application);
        this.getView().byId("idSelectStatus").setSelectedKeys(null);
        this.getView().byId("dateSelection").setValue(null);
      },
    });
  }
);
