const baseUrl = 'http://localhost:3000';

Cypress.Commands.add('isInAddDevicePage', () => {
  cy.url().should('include', '/newDevice');
  cy.contains('Add device');
});

Cypress.Commands.add('isInAddRegulatorPage', () => {
  cy.url().should('include', '/newRegulator');
  cy.contains('Add regulator');
});

Cypress.Commands.add('isInEditDevicePage', () => {
  cy.url().should('include', '/editDevice');
  cy.contains('Edit device');
});

Cypress.Commands.add('isInEditRegulatorPage', () => {
  cy.url().should('include', '/editRegulator');
  cy.contains('Edit regulator');
});

Cypress.Commands.add('isInHomePage', () => {
  cy.url().should('equal', `${baseUrl}/`);
  cy.contains('Regulator devices');
});
