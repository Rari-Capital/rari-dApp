// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("E2E", function() {
  before(() => {
    cy.visit("/");
  });

  it("renders the pool page", () => {
    cy.findByText(/Latest Rari News/i).should("be.visible");
  });
});
