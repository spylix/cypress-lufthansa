/// <reference types="cypress" />

const iterations = 10;
let countTime = 0;

const tenant = "os";

const homepage = {
  lh: "https://www.lufthansa.com/de/en/homepage",
  os: "https://www.austrian.com/de/en/homepage",
  lx: "https://www.swiss.com/de/en/homepage",
  sn: "https://www.brusselsairlines.com/de/en/homepage",
};

const onebooking = {
  lh: "https://api-shop.lufthansa.com/v2/digital-touchpoints/RefX/analytics/performance-logs",
  os: "https://api-shop.austrian.com/v2/digital-touchpoints/RefX/analytics/performance-logs",
  lx: "https://api-shop.swiss.com/v2/digital-touchpoints/RefX/analytics/performance-logs",
  sn: "https://api-shop.brusselsairlines.com/v2/digital-touchpoints/RefX/analytics/performance-logs",
};

const searchButtonLabel = tenant === "os" ? "Search" : "Search flights";

for (let i = 0; i < iterations; i++) {
  describe(`Page Load Time Test ${i}`, () => {
    it("should measure page load time after clicking a link", () => {
      cy.visit(homepage[tenant]);

      cy.wait(1000);

      cy.get("#cm-acceptAll").click();
      cy.get(
        'input[name="flightQuery.flightSegments[0].travelDatetime"]'
      ).click();
      cy.get(
        ".CalendarDay.CalendarDay_1.CalendarDay__default.CalendarDay__default_2"
      )
        .first()
        .click();
      cy.get(
        ".CalendarDay.CalendarDay_1.CalendarDay__default.CalendarDay__default_2"
      )
        .first()
        .click();
      cy.get(".btn.btn-primary.calendar-footer-continue-button")
        .first()
        .click();
      cy.get('input[name="flightQuery.flightSegments[0].destinationCode"]')
        .as("destination")
        .type("JFK");
      cy.wait(2000);
      cy.get("@destination").blur();
      cy.wait(10000); // Wait for prefetch to finish
      cy.get(".btn.btn-primary")
        .get("span")
        .contains(searchButtonLabel)
        .click()
        .then(() => {
          performance.mark(`login-started-${i}`);
        });

      cy.intercept("POST", onebooking[tenant])
        .as(`requestFinished${i}`)
        .then(() => {
          console.log(`Testing request ${i}`);
        });

      cy.wait(`@requestFinished${i}`).then(() => {
        console.log(`Request ${i} finish captured`);
        performance.mark(`login-finished-${i}`);
        const measure = performance.measure(
          `login-duration-${i}`,
          `login-started-${i}`,
          `login-finished-${i}`
        );
        console.log(`Measure duration no. ${i}: ${measure.duration}`);
        countTime += measure.duration;
        console.log(`Incremented count time: ${countTime}`);
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.clearAllSessionStorage();
      });

      if (i === iterations - 1) {
        console.log(`Average duration: ${countTime / iterations}`);
        cy.log(`Average duration: ${countTime / iterations}`);
      }
    });
  });
}
