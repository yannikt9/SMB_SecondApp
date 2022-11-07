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

      /**
       * routes to second page
       * loads correct data by decoding URI parameters
       */
      onInit: function () {
        this.createSalesOrgModel();
        this.createFilterModel();
        this.getRouter()
          .getRoute('secondPage')
          .attachPatternMatched(this._onObjectMatched, this);
      },

      /**
       * filters data if filters have been passed from first page
       * displays passed over filters
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
          /* this.getView()
            .byId('dateSelection')
            .setValue(
              `${this.getModel('filter').getProperty(
                '/dateRange/value1'
              ).toLocaleDateString()} - ${this.getModel('filter').getProperty('/dateRange/value2')}`
            ); */
        }
        this.getView().byId('salesOrgSelection').setSelectedKey(args.location);
        this.getModel('filter').setProperty('/location/value1', args.location);
        console.log(this.getFilterModel().location.value1);
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
       * event handler, after status has been selected
       */
      onStatusSelectionFinished: function (oEvent) {
        this.getModel('filter').setProperty(
          '/selectedStatus/value1',
          oEvent.getSource().getSelectedKeys().toString()
        );
        this._filterChange();
      },

      /**
       * event handler that changes date and filter
       * @param {} oEvent
       */
      onDateChanged: function (oEvent) {
        const dStartDate = new Date(oEvent.getSource().getDateValue());
        const dEndDate = new Date(oEvent.getSource().getSecondDateValue());
        // console.log(dStartDate);
        this.getModel('filter').setProperty('/dateRange/value1', dStartDate);
        // console.log(this.getModel('filter').getProperty('/dateRange/value1'));
        this.getModel('filter').setProperty('/dateRange/value2', dEndDate);
        // console.log(this.getModel('filter').getProperty('/dateRange/value2'));
        this._filterChange();
      },

      /**
       * event handler that changes the sales organization
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
        this.getModel('filter').setProperty('/selectedStatus/value1', null);
        this.getModel('filter').setProperty('/dateRange/value1', null);
        this.getModel('filter').setProperty('/dateRange/value2', null);
        this._filterChange();
        this.getView().byId('statusSelection').setSelectedKeys(null);
        this.getView()
          .byId('salesOrgSelection')
          .setSelectedKey(
            this.getModel('filter').getProperty('/location/value1')
          );

        this.getView().byId('dateSelection').setValue(null);
      },

      /**
       * creates a filter array by checking if values are given
       */
      _applyFilters() {
        const aFilters = [];

        const filterData = this.getFilterModel();
        console.log(filterData);
        /* console.log(this.getFilterModel()); */
        Object.entries(filterData).forEach((e) => {
          const [key, value] = e;
          console.log(e);
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
       * changes URI when filters change
       */
      _filterChange: function () {
        const start = this.getModel('filter').getProperty('/dateRange/value1');
        const end = this.getModel('filter').getProperty('/dateRange/value2');
        console.log(start);
        console.log(end);
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
