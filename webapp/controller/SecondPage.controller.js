sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "../model/formatter",
  ],
  function (Controller, Filter, FilterOperator, FilterType, formatter) {
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
          case "1010":
            return "InlandVerkOrg. DE";
          case "1710":
            return "InlandVerkOrg. US";
          case "2099":
            return "Interlaken";
          case "2040":
            return "Davos";
          case "2060":
            return "Lenzerheide";
          case "2050":
            return "Chur";
          case "2020":
            return "Arosa";
          case "2030":
            return "Laax";
          case "2010":
            return "St. Moritz";
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
        /* this._sStatus = oEvent
          .getParameter("arguments")
          .selectedStatus.split(","); */

        this._dSelectedDate = dateRange.split("!")[0];
        this._dSelectedSecondDate = dateRange.split("!")[1];
        /* let [this._dSelectedDate, this._dSelectedSecondDate ...rest] = dateRange.split("!");*/

        this.getView().byId("secondPageTitle").setText(location);
        if (this._dSelectedSecondDate && this._dSelectedDate !== null) {
          this.getView()
            .byId("dateSelection")
            .setPlaceholder(
              new Date(this._dSelectedDate).toLocaleDateString() +
                " - " +
                new Date(this._dSelectedSecondDate).toLocaleDateString()
            );
        }
        this.getView()
          .byId("idSelectSalesOrganization")
          .setPlaceholder(location);
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
      onSalesOrganizationChanged: function (oEvent) {
        let oComboBox = this.byId("idSelectSalesOrganization");
        let chosenKey = oComboBox.getSelectedKey();
        this._sLocation = chosenKey;
        oComboBox.setPlaceholder(this._convertLocation(this._sLocation));
        this.getView()
          .byId("secondPageTitle")
          .setText(this._convertLocation(this._sLocation));
        this._applyFilters();
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

      deleteButtonPressed: function (oEvent) {
        this._sStatus = [];
        this._dSelectedDate = null;
        this._dSelectedSecondDate = null;
        this._applyFilters();
        this.getView().byId("idSelectStatus").setSelectedKeys(null);
        this.getView().byId("idSelectSalesOrganization").setSelectedKey(null);
        this.getView().byId("dateSelection").setValue(null).setPlaceholder("von - bis");
      },
    });
  }
);
