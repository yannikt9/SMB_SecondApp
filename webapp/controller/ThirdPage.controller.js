sap.ui.define(
  [
    './BaseController',
    '../model/formatter',
    'sap/ui/model/json/JSONModel',
  ],
  function (BaseController, formatter, JSONModel) {
    return BaseController.extend('project1.controller.ThirdPage', {
      formatter: formatter,

      /**
       * reads corresponding models out of URI template strings
       * @param {} oEvent
       */
      onObjectMatched: function (oEvent) {
        const args = oEvent.getParameter('arguments');
        this.getView().bindElement({
          path: `/A_SalesOrder('${args.results}')`,
        });
        this.getOwnerComponent()
          .getModel('secondSource')
          .read(`/A_BusinessPartner('${args.businessPartner}')`, {
            urlParameters: {
              $expand: 'to_BusinessPartnerAddress',
            },
            success: (data) => {
              this.getView().getModel('businessPartnerModel').setData(data);
            },
          });
      },

      /**
       * sets bound models to Third Page
       */
      onInit: function () {
        this.getView().setModel(new JSONModel(), 'businessPartnerModel');
        this.getRouter()
          .getRoute('thirdPage')
          .attachPatternMatched(this.onObjectMatched, this);
      },

      onNavBack: function () {
        window.history.go(-1);
      },
    });
  }
);
