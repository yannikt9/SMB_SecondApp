sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "../model/formatter",
    "sap/ui/core/routing/History",
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
      /**
       * converts statusCharacter into string and vice versa
       * @param {} sStatus
       * @returns statusString
       */
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
      /**
       * converts locationNumbers into string and vice versa
       * @param {} sLocation
       * @returns locationNumber and locationString
       */
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
      /**
       * routing to second page
       * loading the right data by decoding the uri parameters
       */
      onInit: function () {
        // set explored app's demo model on this sample

        let oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("secondPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: function (oEvent) {
        this._sStatus = [];
        let location = oEvent.getParameter("arguments").location;
        let dateRange = window.decodeURIComponent(
          oEvent.getParameter("arguments").dateRange
        );
        /* this._sStatus = oEvent
          .getParameter("arguments")
          .selectedStatus.split(","); */

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
      /**
       * change selected status and filter / event handler
       * @param {} oEvent
       */
      handleSelectionChange: function (oEvent) {
        this._sStatus = oEvent.getSource().getSelectedKeys();
      },
      handleSelectionFinish: function () {
        this._applyFilters();
      },
      /**
       * change date and filter / event handler
       * @param {} oEvent
       */
      onDateChanged: function (oEvent) {
        this._dSelectedDate = oEvent.getSource().getDateValue();
        this._dSelectedSecondDate = oEvent.getSource().getSecondDateValue();
        this._applyFilters();
      },
      /**
       * change salesOrganization / event handler
       * @param {} oEvent
       */
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
      /**
       * load third page by clicking on table row / event handler
       * @param {} oEvent
       */
      onRowPressed: function (oEvent) {
        let oItem = oEvent.getSource().getBindingContext().getPath();
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("thirdPage", {
          results: window.encodeURIComponent(oItem),
        });
      },
      /**
       * function to create a filter array by checking if values are given
       */
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
      /**
       * delete all filters and set values to null / event handler
       * @param {} oEvent 
       */
      deleteButtonPressed: function (oEvent) {
        this._sStatus = [];
        this._dSelectedDate = null;
        this._dSelectedSecondDate = null;
        this._applyFilters();
        this.getView().byId("idSelectStatus").setSelectedKeys(null);
        this.getView().byId("idSelectSalesOrganization").setSelectedKey(null);
        this.getView()
          .byId("dateSelection")
          .setValue(null)
          .setPlaceholder("von - bis");
      },

      onNavBack: function (oEvent) {
        window.history(-1);
      }
    });
  }
);
