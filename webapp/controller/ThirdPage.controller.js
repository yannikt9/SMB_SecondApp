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
       * reads corresponding models out of URI via Template Strings
       * @param {} oEvent
       */
      _onObjectMatched: function (oEvent) {
        const args = oEvent.getParameter('arguments');
        // nconst path = oEvent.getParameter("arguments").results;
        // let businessPartner = oEvent.getParameter("arguments").businessPartner;
        this.getView().bindElement({
          path: `/A_SalesOrder('${args.result}')`,
        });
        /* this.createSOModel().then(()=>{
          let a = this.getSoModel().filter((e) => e.SalesOrganization === 
          )[0].SalesOrganizationName;
         }) */
        this.getOwnerComponent()
          .getModel('secondSource')
          .read(`/A_BusinessPartner('${args.businessPartner}')`, {
            urlParameters: {
              $expand: 'to_BusinessPartnerAddress',
            },
            success: (data) => {
              this.getView().getModel('bpModel').setData(data);
            },
          });
      },

      /**
       * sets bound models to Third Page
       */
      onInit: function () {
        this.getView().setModel(new JSONModel(), 'bpModel');
        this.getRouter()
          .getRoute('thirdPage')
          .attachPatternMatched(this._onObjectMatched, this);
      },

      onNavBack: function () {
        window.history.go(-1);
      },
    });
  }
);
