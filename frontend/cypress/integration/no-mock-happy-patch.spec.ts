import '../support/index';

const getMethods = (obj: any) => Object.getOwnPropertyNames(obj);
describe('No mock happy patch', () => {
  const newDeviceName = 'Cypress device name';
  const newRegulatorName = 'Cypress regulator name';

  beforeEach(() => {
    cy.visit('/');
    cy.route({ method: 'GET', url: '/devices' }).as('devices-list-req');
    cy.route({ method: 'GET', url: '/regulators' }).as('regulators-list-req');

    cy.get('.ant-menu li').eq(0).as('devices-link');
    cy.get('.ant-menu li').eq(1).as('new-device-link');
    cy.get('.ant-menu li').eq(2).as('new-regulator-link');
  });

  function fillDeviceTheForm() {
    cy.get('#name').type(newDeviceName);

    cy.get('#regulatorId').click();
    cy.get('.ant-select-dropdown .ant-select-item').eq(0).click();

    cy.get('#address').clear().type('127.0.0.1');
    cy.get('#port').type('42069');

    cy.get('input[type=file]').attachFile({ filePath: 'key.public.rsa', encoding: 'binary' });
  }

  function editDeviceForm() {
    cy.get('#name').type(`-edited`);

    cy.get('#regulatorId').click();
    cy.get('.ant-select-dropdown .ant-select-item').eq(1).click();

    cy.get('#address').clear().type('localhost');
    cy.get('#port').clear().type('12000');
  }

  function checkEditedDevice() {
    cy.get('#name').then((input) => {
      expect(input.val()).to.equal(`${newDeviceName}-edited`);
    });
    cy.get('.ant-select-selection-item').contains('Regulator Regulator [type: TEMPERATURE]');
    cy.get('#address').then((input) => {
      expect(input.val()).to.equal(`localhost`);
    });
    cy.get('#port').then((input) => {
      expect(input.val()).to.equal(`12000`);
    });
  }

  it('devices should work', () => {
    cy.wait(['@devices-list-req', '@regulators-list-req']); // first call
    cy.get('@new-device-link').click();

    cy.isInAddDevicePage();

    fillDeviceTheForm();

    cy.dataCy('submit-btn').click();

    cy.isInHomePage();

    cy.contains(newDeviceName).click();

    cy.isInEditDevicePage();
    editDeviceForm();

    cy.dataCy('submit-btn').click();

    cy.dataCy('devices-table').contains(`${newDeviceName}-edited`).click();
    checkEditedDevice();

    cy.dataCy('del-btn').click();

    cy.isInHomePage();
    cy.dataCy('devices-table').should('not.contain', 'No Data');
    cy.dataCy('devices-table').contains(`${newDeviceName}-edited`).should('not.exist');
  });

  function fillOutRegulatorTheForm() {
    cy.get('#name').type(newRegulatorName);

    cy.get('#type').click();
    cy.get('.ant-select-dropdown .ant-select-item').eq(0).click();

    cy.get('#address').clear().type('127.0.0.1');
    cy.get('#port').type('42069');

    cy.get('input[type=file]').attachFile({ filePath: 'key.public.rsa', encoding: 'binary' });
  }

  function editRegulatorForm() {
    cy.get('#name').type(`-edited`);

    cy.get('#type').click();
    cy.get('.ant-select-dropdown .ant-select-item').eq(1).click();

    cy.get('#address').clear().type('localhost');
    cy.get('#port').clear().type('12000');
  }

  function checkEditedRegulator() {
    cy.get('#name').then((input) => {
      expect(input.val()).to.equal(`${newRegulatorName}-edited`);
    });
    cy.get('.ant-select-selection-item').contains('Temperature');
    cy.get('#address').then((input) => {
      expect(input.val()).to.equal(`localhost`);
    });
    cy.get('#port').then((input) => {
      expect(input.val()).to.equal(`12000`);
    });
  }

  it('regulators should work', () => {
    cy.get('@new-regulator-link').click();

    cy.isInAddRegulatorPage();

    fillOutRegulatorTheForm();

    cy.dataCy('submit-btn').click();

    cy.isInHomePage();

    cy.contains(newRegulatorName).click();

    cy.isInEditRegulatorPage();

    editRegulatorForm();

    cy.dataCy('submit-btn').click();

    cy.dataCy('regulators-table').contains(`${newRegulatorName}-edited`).click();
    checkEditedRegulator();

    cy.dataCy('del-btn').click();

    cy.isInHomePage();
    cy.dataCy('regulators-table').should('not.contain', 'No Data');
    cy.dataCy('regulators-table').contains(`${newRegulatorName}-edited`).should('not.exist');
  });
});