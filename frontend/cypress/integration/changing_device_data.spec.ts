import '../support/index';

const temperatureChangerSelector =
  '.data-cy-devices-table [data-row-key="114"] .cy-data-change-temperature-input input';

const lightChangerSelector = '.data-cy-devices-table [data-row-key="15"] .cy-data-light-switch';

describe('Devices lists test', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.route({ method: 'POST', url: '/devices/temperature/setTargetData' }).as('change-temperature-device-data');
    cy.route({ method: 'POST', url: '/devices/light/setTargetData' }).as('change-light-device-data');
  });

  it('should correctly change the data', () => {
    cy.get(temperatureChangerSelector).clear().type('100.12').should('be.disabled');

    cy.get('.data-cy-devices-table [data-row-key="114"] .data-cy-spinner');

    cy.wait('@change-temperature-device-data');
    cy.get('.data-cy-devices-table [data-row-key="15"] .data-cy-spinner').should('not.exist');

    cy.get('@change-temperature-device-data').its('requestBody').should('deep.equal', {
      id: 114,
      targetData: 100.12,
    });

    cy.get(temperatureChangerSelector).should('have.value', '100.12');

    cy.get(lightChangerSelector).get('[aria-checked=false]');

    cy.get(lightChangerSelector).click();

    cy.get('.data-cy-devices-table [data-row-key="15"] .data-cy-spinner');

    cy.wait('@change-light-device-data');

    cy.get('.data-cy-devices-table [data-row-key="15"] .data-cy-spinner').should('not.exist');

    cy.get('@change-light-device-data').its('requestBody').should('deep.equal', {
      id: 15,
      targetData: true,
    });

    cy.get(lightChangerSelector).get('[aria-checked=true]');
  });
});
