import '../support/index';

describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.route({
      url: '/devices/*',
      method: 'DELETE',
      status: 204,
      response: {},
    });

    cy.route({
      url: '/regulators/*',
      method: 'DELETE',
      status: 204,
      response: {},
    });

    cy.get('.ant-menu li').eq(0).as('devices-link');
    cy.get('.ant-menu li').eq(1).as('new-device-link');
    cy.get('.ant-menu li').eq(2).as('new-regulator-link');
  });

  it('should enter every route', () => {
    cy.get('@new-device-link').click();

    cy.isInAddDevicePage();

    cy.get('@new-regulator-link').click();

    cy.isInAddRegulatorPage();

    cy.get('.ant-page-header-back').click();

    cy.isInAddDevicePage();

    cy.get('.ant-page-header-back').click();

    cy.isInHomePage();

    cy.dataCy('devices-table tbody [data-row-key=114]').click();

    cy.isInEditDevicePage();
    cy.url().should('include', '114');

    cy.dataCy('del-btn').click();

    cy.dataCy('regulators-table tbody [data-row-key=14]').click();

    cy.isInEditRegulatorPage();
    cy.url().should('include', '14');

    cy.dataCy('del-btn').click();

    cy.isInHomePage();
  });
});
