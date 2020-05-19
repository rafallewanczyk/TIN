import '../support/index';

describe('Devices lists test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display tables of devices', () => {
    cy.get('.data-cy-regulators-table tbody').children().should('have.length', 3);
    cy.get('.data-cy-devices-table tbody').children().should('have.length', 3);
  });

  it('should display no data in table when there are no devices', () => {
    cy.route({
      method: 'GET',
      url: '/devices',
      response: [],
    });

    cy.get('.data-cy-devices-table').contains('No Data');
    cy.get('.data-cy-regulators-table tbody').children().should('have.length', 3);
  });

  it('should display no data in table when there are no regulators', () => {
    cy.route({
      method: 'GET',
      url: '/regulators',
      response: [],
    });

    cy.get('.data-cy-devices-table tbody').children().should('have.length', 3);
    cy.get('.data-cy-regulators-table').contains('No Data');
  });
});
