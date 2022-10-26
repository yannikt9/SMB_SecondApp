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
      _aFilters: [],

      // TODO: Umbau der Properties auf Model mit Binding der Filter-Controls

      /**
       * filters data if filters have been passed from first page
       * displays passed over filters
       * @param {} oEvent
       */
      _onObjectMatched: function (oEvent) {
        this._aStatus = [];
        const args = oEvent.getParameter('arguments');

        // TODO: Direkt im XML
        this.getView()
          .byId('dateSelection')
          .setPlaceholder(this.resources().getText('calendar'));

        if (args.selectedStatus) {
          this._aStatus = oEvent
            .getParameter('arguments') // TODO: ERsetzen durch 'args'
            .selectedStatus.split(',');
        }

        if (args.dateRange) {
          // // TODO: Destructuring
          // const [iStart, iEnd] = args.dateRange.split('!');

          this._dStartDate = new Date(
            parseInt(args.dateRange.split('!')[0], 10)
          );
          this._dEndDate = new Date(parseInt(args.dateRange.split('!')[1], 10));

          // TODO: Prüfen, ob Date Values übergeben werden können (setValue, setSecondaryValue)
          this.getView()
            .byId('dateSelection')
            .setValue(
              `${this._dStartDate.toLocaleDateString()} - ${this._dEndDate.toLocaleDateString()}`
            );
        }
        // TODO: Element idSelectStatus ohne id + einheitlich (siehe dateSelection)
        // dateSelection + statusSelection || selectStatus + selectDate
        this.getView().byId('idSelectStatus').setSelectedKeys(this._aStatus);
        this.getView()
          .byId('idSelectSalesOrganization')
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
        this._applyFilters();
      },

      /**
       * creates a filter array by checking if values are given
       */
      _applyFilters() {
        this._aFilters = []; // TODO: Lokale Var
        if (this._sLocation) {
          this._aFilters.push(
            new Filter(
              'SalesOrganization',
              FilterOperator.Contains, // TODO: Equals und mit Hanna schimpfen
              this._sLocation
            )
          );
        }
        if (this._aStatus.length !== 0) {
          this._aStatus.forEach((element) => {
            this._aFilters.push(
              new Filter(
                'OverallDeliveryStatus',
                FilterOperator.Contains,
                element
              )
            );
          });
        }
        if (this._dEndDate && this._dStartDate) {
          this._aFilters.push(
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
          .filter(this._aFilters, FilterType.Application);
      },

      /**
       * changes URI when filters change
       */
      _filterChange: function () {
        this.getRouter().navTo('secondPage', {
          location: this._sLocation,
          dateRange: this.dateRangeConvert(this._dStartDate, this._dEndDate),
          selectedStatus: this._aStatus.toString(),
        });
      },

      /**
       * event handler that changes selected status and filter
       * @param {} oEvent
       */

      // TODO: onX....
      // TODO: Namen mit Bezug zu Status
      handleSelectionChange: function (oEvent) {
        this._aStatus = oEvent.getSource().getSelectedKeys();
      },

      // TODO: onX....
      handleSelectionFinish: function () {
        this._filterChange();
      },

      /**
       * event handler that changes date and filter
       * @param {} oEvent
       */
      onDateChanged: function (oEvent) {
        this._dStartDate = new Date(oEvent.getSource().getDateValue());
        this._dEndDate = new Date(oEvent.getSource().getSecondDateValue());
        this._filterChange();
      },

      /**
       * routes to second page
       * loads correct data by decoding URI parameters
       */
      // TODO: Reihenfolge
      onInit: function () {
        this.getRouter()
          .getRoute('secondPage')
          .attachPatternMatched(this._onObjectMatched, this);
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
        this._filterChange();
      },

      /**
       * navigates to third page and passes according sales order and business partner through URI
       * @param {} oEvent
       */
      onRowPressed: function (oEvent) {
        const oObject = this.getView()
          .getModel()
          .getObject(oEvent.getSource().getBindingContext().getPath());

        this.getRouter().navTo('thirdPage', {
          results: oObject.SalesOrder,
          businessPartner: oObject.SoldToParty,
        });
      },

      /**
       * empties all filters
       * @param {} oEvent
       */
      // TODO: Naming onX....
      // TODO: Sinnvoller Name...
      deleteButtonPressed: function () {
        this._aStatus = [];
        this._dStartDate = null;
        this._dEndDate = null;
        this._filterChange();
        this.getView().byId('idSelectStatus').setSelectedKeys(null);
        this.getView()
          .byId('idSelectSalesOrganization')
          .setSelectedKey(this._sLocation);

        this.getView()
          .byId('dateSelection')
          .setValue(null)
          .setPlaceholder(this.resources().getText('calendar'));
      },
    });
  }
);
