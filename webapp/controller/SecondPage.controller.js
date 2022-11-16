sap.ui.define(
  [
    './BaseController',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterType',
    '../model/formatter',
  ],
  function (BaseController, Filter, FilterType, formatter) {
    return BaseController.extend('project1.controller.SecondPage', {
      formatter: formatter,

      /**
       * Routes to second page
       * Loads correct data by decoding URI parameters
       */
      onInit: function () {
        this.createSalesOrgModel();
        this.createFilterModel();
        this.getRouter()
          .getRoute('secondPage')
          .attachPatternMatched(this._onObjectMatched, this);
      },

      /**
       * Filters data in case filter arguments have been passed over from home page
       * Displays said filters
       * @param {} oEvent
       */
      _onObjectMatched: function (oEvent) {
        const args = oEvent.getParameter('arguments');
        this.getView()
          .byId('dateSelection')
          .setPlaceholder(this.getText('calendarPlaceholder'));

        this.getModel('filter').setProperty(
          '/selectedStatus/value1',
          args.selectedStatus
        );
        if (args.dateRange) {
          const [iStart, iEnd] = args.dateRange.split('!');
          const startDate = new Date(parseInt(iStart, 10));
          const endDate = new Date(parseInt(iEnd, 10));
          this.getModel('filter').setProperty('/dateRange/value1', startDate);
          this.getModel('filter').setProperty('/dateRange/value2', endDate);
        }
        if (args.selectedStatus) {
          this.getView()
            .byId('statusSelection')
            .setSelectedKeys(args.selectedStatus.split(','));
        }
        this.getView().byId('salesOrgSelection').setSelectedKey(args.location);
        this.getModel('filter').setProperty('/location/value1', args.location);
        this.createSalesOrgModel().then(() => {
          const value1 =
            this.getModel('filter').getProperty('/location/value1');
          this.getView()
            .byId('secondPageTitle')
            .setText(
              this.getSalesOrgModel().find(
                (e) => e.SalesOrganization === value1
              ).SalesOrganizationName
            );
        });
        this._applyFilters();
      },

      /**
       * Event handler that filters model using selected statuses
       */
      onStatusSelectionFinished: function (oEvent) {
        this.getModel('filter').setProperty(
          '/selectedStatus/value1',
          oEvent.getSource().getSelectedKeys().toString()
        );
        this._filterChange();
      },

      /**
       * Event handler that filters model using selected date range
       * @param {} oEvent
       */
      onDateChanged: function (oEvent) {
        const dStartDate = new Date(oEvent.getSource().getDateValue());
        const dEndDate = new Date(oEvent.getSource().getSecondDateValue());
        this.getModel('filter').setProperty('/dateRange/value1', dStartDate);
        this.getModel('filter').setProperty('/dateRange/value2', dEndDate);
        this._filterChange();
      },

      /**
       * Event handler that filters model by selected sales organization
       * @param {} oEvent
       */
      onSalesOrgChanged: function (oEvent) {
        this.getModel('filter').setProperty(
          '/location/value1',
          oEvent.getSource().getSelectedKey()
        );
        this._filterChange();
      },

      /**
       * Navigates to third page and passes according sales order and business partner through URI
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
       * Empties all filters
       * @param {} oEvent
       */
      onDeleteFilter: function () {
        this.getModel('filter').setProperty('/selectedStatus/value1', null);
        this.getModel('filter').setProperty('/dateRange/value1', null);
        this.getModel('filter').setProperty('/dateRange/value2', null);
        this._filterChange();
        this.getView().byId('statusSelection').setSelectedKeys(null);
        this.getView().byId('dateSelection').setValue(null);
      },

      /**
       * Creates a filter array by checking if values are given
       * Applies filter array to table
       */
      _applyFilters() {
        const aFilters = [];
        const filterData = this.getFilterModel();
        Object.entries(filterData).forEach((e) => {
          const [key, value] = e;
          if (!value.value1) return;
          if (key === 'selectedStatus' && value.value1.length > 1) {
            const values = value.value1.split(',');
            values.forEach((el) =>
              aFilters.push(new Filter(value.path, value.operator, el))
            );
            return;
          }
          aFilters.push(
            new Filter(value.path, value.operator, value.value1, value.value2)
          );
        });

        this.getView()
          .byId('orderTable')
          .getBinding('items')
          .filter(aFilters, FilterType.Application);
      },

      /**
       * Updates URI when filters change
       */
      _filterChange: function () {
        const start = this.getModel('filter').getProperty('/dateRange/value1');
        const end = this.getModel('filter').getProperty('/dateRange/value2');
        this.getRouter().navTo('secondPage', {
          location: this.getModel('filter').getProperty('/location/value1'),
          dateRange: this.convertDateRangeToTemplateString(start, end),
          selectedStatus: this.getModel('filter').getProperty(
            '/selectedStatus/value1'
          ),
        });
      },
    });
  }
);
