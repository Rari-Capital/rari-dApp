// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("E2E", function () {
  before(() => {
    cy.visit("/");
  });

  it("renders the home page", () => {
    cy.findByText(/Connect Wallet/i).should("be.visible");
    cy.findByText(/Get Wallet/i).should("be.visible");
  });
});
