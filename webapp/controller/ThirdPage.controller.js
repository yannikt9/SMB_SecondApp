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
      _onObjectMatched: function (oEvent) {
        const args = oEvent.getParameter('arguments');
        this.getView().bindElement({
          path: `/A_SalesOrder('${args.results}')`,
        });

        // TODO: Binding auf zweites Model ohne JSON Zwischenmodel

        // this.byId('blockBusinessPartner').bindElement({
        //   path: `/A_BusinessPartner('${args.businessPartner}')`,
        //   model: 'secondSource',
        //   // expand...
        // });

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
          .attachPatternMatched(this._onObjectMatched, this);
      },

      onNavBack: function () {
        // TODO: onNavToSecondPage, ohne Historie nur mit Routing
        window.history.go(-1);
      },
    });
  }
);
