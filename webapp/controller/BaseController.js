sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(
	Controller
) {
	"use strict";

	return Controller.extend("project1.controller.BaseController", {
		/**
       * converts locationNumbers into string and vice versa
       * @param {} sLocation
       * @returns locationNumber and locationString
       */
		 convertLocation(sLocation) {
			switch (sLocation) {
			  case "InlandVerkOrg. DE":
				return "1010";
			  case "InlandVerkOrg. US":
				return "1710";
			  case "St. Moritz":
				return "2010";
			  case "Arosa":
				return "2020";
			  case "Laax":
				return "2030";
			  case "Davos":
				return "2040";
			  case "Chur":
				return "2050";
			  case "Lenzerheide":
				return "2060";
			  case "Interlaken":
				return "2099";
			  case "1010":
				return "InlandVerkOrg. DE";
			  case "1710":
				return "InlandVerkOrg. US";
			  case "2099":
				return "Interlaken";
			  case "2040":
				return "Davos";
			  case "2060":
				return "Lenzerheide";
			  case "2050":
				return "Chur";
			  case "2020":
				return "Arosa";
			  case "2030":
				return "Laax";
			  case "2010":
				return "St. Moritz";
			}
		  },
	});
});