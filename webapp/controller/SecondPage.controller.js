sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "../model/formatter",
  ],
  function (BaseController, Filter, FilterOperator, FilterType, formatter) {
    "use strict";

    return BaseController.extend("project1.controller.SecondPage", {
      formatter: formatter,
      _sLocation: "",
      _aStatus: [],
      _dStartDate: "",
      _dEndDate: "",
      _aFilters: [],

      _onObjectMatched: function (oEvent) {
        this.createSOModel();

        this._aStatus = [];
        let args = oEvent.getParameter("arguments");
        this.getView()
          .byId("dateSelection")
          .setPlaceholder(this.resources().getText("calendar"));
        /* this.getView()
          .byId("secondPageTitle")
          .setText(this.convertLocation(args.location)); */
        if (args.selectedStatus) {
          this._aStatus = oEvent
            .getParameter("arguments")
            .selectedStatus.split(",");
        }

        if (args.dateRange) {
          this._dStartDate = new Date(parseInt(args.dateRange.split("!")[0]));
          this._dEndDate = new Date(parseInt(args.dateRange.split("!")[1]));

          this.getView()
            .byId("dateSelection")
            .setValue(
              `${this._dStartDate.toLocaleDateString()} - ${this._dEndDate.toLocaleDateString()}`
            );
        }
        this.getView().byId("idSelectStatus").setSelectedKeys(this._aStatus);
        this.getView()
          .byId("idSelectSalesOrganization")
          .setSelectedKey(args.location);
        this._sLocation = args.location;
        this._applyFilters();
      },

      _filterChange: function () {
        this.getRouter().navTo("secondPage", {
          location: this._sLocation,
          dateRange: this.dateRangeConvert(this._dStartDate, this._dEndDate),
          selectedStatus: this._aStatus.toString(),
        });
      },

      /**
       * routing to second page
       * loading the right data by decoding the uri parameters
       */
      onInit: function () {
        this.getRouter()
          .getRoute("secondPage")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      /**
       * change selected status and filter / event handler
       * @param {} oEvent
       */
      handleSelectionChange: function (oEvent) {
        this._aStatus = oEvent.getSource().getSelectedKeys();
      },

      handleSelectionFinish: function () {
        this._filterChange();
      },

      /**
       * change date and filter / event handler
       * @param {} oEvent
       */
      onDateChanged: function (oEvent) {
        this._dStartDate = oEvent.getSource().getDateValue();
        this._dEndDate = oEvent.getSource().getSecondDateValue();
        this._filterChange();
      },

      /**
       * change salesOrganization / event handler
       * @param {} oEvent
       */
      onSalesOrganizationChanged: function (oEvent) {
        let oComboBox = this.byId("idSelectSalesOrganization");
        let chosenKey = oComboBox.getSelectedKey();
        this._sLocation = chosenKey;
        oComboBox.setValue(this.convertLocation(this._sLocation));
        this.getView()
          .byId("secondPageTitle")
          .setText(this.convertLocation(this._sLocation));
        this._filterChange();
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
          businessPartner: this.getView()
            .getModel()
            .getObject(oEvent.getSource().getBindingContext().getPath())
            .SoldToParty,
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
        if (this._aStatus.length !== 0) {
          this._aStatus.forEach((element) => {
            this._aFilters.push(
              new Filter(
                "OverallDeliveryStatus",
                FilterOperator.Contains,
                element
              )
            );
          });
        }
        if (this._dEndDate && this._dStartDate) {
          this._aFilters.push(
            new Filter(
              "SalesOrderDate",
              FilterOperator.BT,
              this._dStartDate,
              this._dEndDate
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
        this._aStatus = [];
        this._dStartDate = null;
        this._dEndDate = null;
        this._filterChange();
        this.getView().byId("idSelectStatus").setSelectedKeys(null);
        this.getView()
          .byId("idSelectSalesOrganization")
          .setSelectedKey(this._sLocation);

        this.getView()
          .byId("dateSelection")
          .setValue(null)
          .setPlaceholder(this.resources().getText("calendar"));
      },
    });
  }
);
