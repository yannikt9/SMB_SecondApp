sap.ui.define(
  ['./BaseController', '../model/formatter', 'sap/ui/model/json/JSONModel'],
  function (BaseController, formatter, JSONModel) {
    return BaseController.extend('project1.controller.ThirdPage', {
      formatter: formatter,

      /**
       * Sets bound models in third page
       */
      onInit: function () {
        this.getView().setModel(new JSONModel(), 'businessPartner');
        this.getRouter()
          .getRoute('thirdPage')
          .attachPatternMatched(this._onObjectMatched, this);
      },
      
      /**
       * Reads arguments for model out of URI template strings
       * @param {} oEvent
       */
      _onObjectMatched: function (oEvent) {
        const args = oEvent.getParameter('arguments');
        this.getView().bindElement({
          path: `/A_SalesOrder('${args.results}')`,
        });
        this.getOwnerComponent()
          .getModel('bp')
          .read(`/A_BusinessPartner('${args.businessPartner}')`, {
            urlParameters: {
              $expand: 'to_BusinessPartnerAddress',
            },
            success: (data) => {
              this.getView().getModel('businessPartner').setData(data);
            },
          });
      },

      onNavBack: function () {
        window.history.go(-1);
      },
    });
  }
);
