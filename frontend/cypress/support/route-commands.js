beforeEach(() => {
  cy.server(); // enable response stubbing
  cy.route({
    method: 'GET',
    url: '/devices',
    response: 'fixture:devices.json',
  });
  cy.route({
    method: 'GET',
    url: '/regulators',
    response: 'fixture:regulators.json',
  });
});
