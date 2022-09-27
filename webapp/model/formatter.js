sap.ui.define([], function () {
  "use strict";

  return {
    formatDate (dOrderDate){
        return dOrderDate.toLocaleDateString();
    },
  };
});
