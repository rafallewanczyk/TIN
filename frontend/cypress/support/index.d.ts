declare namespace Cypress {
  interface FixtureData {
    filePath: string;
    fileContent?: Blob;
    fileName?: string;
    encoding?: string;
    mimeType?: string;
  }

  interface FileProcessingOptions {
    subjectType?: 'input' | 'drag-n-drop';
    force?: boolean;
    allowEmpty?: boolean;
  }

  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<Element>;
    isInAddDevicePage(): null;
    isInAddRegulatorPage(): null;
    isInEditDevicePage(): null;
    isInEditRegulatorPage(): null;
    isInHomePage(): null;

    /**
     * Command to attach file(s) to given HTML element as subject
     * @param fixture file to attach
     * @param processingOpts affects the way of fixture processing
     */
    attachFile(
      fixture: string | FixtureData,
      processingOpts?: FileProcessingOptions,
    ): Chainable<Subject>;
  }
}
