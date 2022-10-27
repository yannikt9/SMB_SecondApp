sap.ui.define(
  [
    './BaseController',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/FilterType',
    '../model/formatter',
  ],
  function (BaseController, Filter, FilterOperator, FilterType, formatter) {
    return BaseController.extend('project1.controller.SecondPage', {
      formatter: formatter,
      _sLocation: '',
      _dStartDate: '',
      _dEndDate: '',
      _aStatus: [],

      /**
       * routes to second page
       * loads correct data by decoding URI parameters
       */
      onInit: function () {
        this.getRouter()
          .getRoute('secondPage')
          .attachPatternMatched(this.onObjectMatched, this);
      },

      /**
       * filters data if filters have been passed from first page
       * displays passed over filters
       * @param {} oEvent
       */
      onObjectMatched: function (oEvent) {
        this._aStatus = [];
        const args = oEvent.getParameter('arguments');

        if (args.selectedStatus) {
          this._aStatus = args.selectedStatus.split(',');
        }

        if (args.dateRange) {
          const [iStart, iEnd] = args.dateRange.split('!');
          this._dStartDate = new Date(parseInt(iStart, 10));
          this._dEndDate = new Date(parseInt(iEnd, 10));

          this.getView()
            .byId('dateSelection')
            .setValue(`${this._dStartDate.toLocaleDateString()} - ${this._dEndDate.toLocaleDateString()}`);
        }
        this.getView().byId('statusSelection').setSelectedKeys(this._aStatus);
        this.getView()
          .byId('salesOrganizationSelection')
          .setSelectedKey(args.location);
        this._sLocation = args.location;
        this.createSalesOrganizationModel().then(() => {
          this.getView()
            .byId('secondPageTitle')
            .setText(
              this.getSalesOrganizationModel().filter(
                (e) => e.SalesOrganization === this._sLocation
              )[0].SalesOrganizationName
            );
        });
        this.applyFilters();
      },

      /**
       * event handler that changes selected status and filter
       * @param {} oEvent
       */
      onStatusSelectionChange: function (oEvent) {
        this._aStatus = oEvent.getSource().getSelectedKeys();
      },

      /**
       * event handler, after status has been selected
       */
      onStatusSelectionFinished: function () {
        this.filterChange();
      },

      /**
       * event handler that changes date and filter
       * @param {} oEvent
       */
      onDateChanged: function (oEvent) {
        this._dStartDate = new Date(oEvent.getSource().getDateValue());
        this._dEndDate = new Date(oEvent.getSource().getSecondDateValue());
        this.filterChange();
      },

      /**
       * event handler that changes the sales organization
       * @param {} oEvent
       */
      onSalesOrganizationChanged: function () {
        const oComboBox = this.byId('idSelectSalesOrganization');
        const chosenKey = oComboBox.getSelectedKey();
        this._sLocation = chosenKey;
        oComboBox.setValue(this._sLocation);
        this.filterChange();
      },

      /**
       * navigates to third page and passes according sales order and business partner through URI
       * @param {} oEvent
       */
      onRowPressed: function (oEvent) {
        this.getRouter().navTo('thirdPage', {
          results: this.getView()
            .getModel()
            .getObject(oEvent.getSource().getBindingContext().getPath())
            .SalesOrder,
          businessPartner: this.getView()
            .getModel()
            .getObject(oEvent.getSource().getBindingContext().getPath())
            .SoldToParty,
        });
      },

      /**
       * empties all filters
       * @param {} oEvent
       */
      onDeleteFilter: function () {
        this._aStatus = [];
        this._dStartDate = null;
        this._dEndDate = null;
        this.filterChange();
        this.getView().byId('idSelectStatus').setSelectedKeys(null);
        this.getView()
          .byId('idSelectSalesOrganization')
          .setSelectedKey(this._sLocation);

        this.getView()
          .byId('dateSelection')
          .setValue(null)
          .setPlaceholder(this.resources().getText('calendar'));
      },

      /**
       * creates a filter array by checking if values are given
       */
      applyFilters() {
        const aFilters = [];
        if (this._sLocation) {
          aFilters.push(
            new Filter('SalesOrganization', FilterOperator.EQ, this._sLocation)
          );
        }
        if (this._aStatus.length !== 0) {
          this._aStatus.forEach((element) => {
            aFilters.push(
              new Filter('OverallDeliveryStatus', FilterOperator.EQ, element)
            );
          });
        }
        if (this._dEndDate && this._dStartDate) {
          aFilters.push(
            new Filter(
              'SalesOrderDate',
              FilterOperator.BT,
              this._dStartDate,
              this._dEndDate
            )
          );
        }
        this.getView()
          .byId('orderTable')
          .getBinding('items')
          .filter(aFilters, FilterType.Application);
      },

      /**
       * changes URI when filters change
       */
      filterChange: function () {
        this.getRouter().navTo('secondPage', {
          location: this._sLocation,
          dateRange: this.dateRangeConvert(this._dStartDate, this._dEndDate),
          selectedStatus: this._aStatus.toString(),
        });
      },
    });
  }
);
