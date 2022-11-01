sap.ui.define(
  [
    'sap/ui/core/UIComponent',
    'sap/ui/Device',
    'project1/model/models',
    'sap/ui/model/json/JSONModel',
  ],
  function (UIComponent, Device, models, JSONModel) {
    return UIComponent.extend('project1.Component', {
      metadata: {
        manifest: 'json',
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();

        // set the device model
        this.setModel(models.createDeviceModel(), 'device');

        this.setModel(
          new JSONModel([
            { status: 'A', name: 'Erfasst' },
            { status: 'B', name: 'In Bearbeitung' },
            { status: 'C', name: 'Ausgeführt' },
          ]),
          'status'
        );
      },
    });
  }
);
