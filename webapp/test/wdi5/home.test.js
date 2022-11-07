const { wdi5 } = require("wdio-ui5-service")

describe("testing our home page", () => {
  before(async () => {
    await wdi5.goTo("/")
  })

  it("check our pages title", async () => {
    const pageTitle = await  browser.getTitle();
    expect(pageTitle).toEqual("SMB_SecondApp")
  })
})

describe("testing page title", () => {
    before(async () => {
      await wdi5.goTo("/")
    })
  
    it("check our pages title", async () => {
        const property = {
            property: {
              controlType: "sap.f.DynamicPageTitle",
              viewName: "project1.view.App"
            }
          };
          const properties = await browser.allControls(property)
          const titleOfPage = await properties.getText()
    })
  })

// retrieve specfically
/* const control = await browser.asControl(selector) */
/* const text = await control.getText() */
/* const property = {
    property: {
      controlType: "sap.f.DynamicPageTitle",
      viewName: "project1.view.App"
    }
  } */
/* const properties = await control.getProperty(property) */
/* const properties = await browser.allControls(property)
const titleOfPage = await properties.getText() */

// use fluent async api
/* const text = await browser.asControl(selector).getText() */