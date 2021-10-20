import { mount } from '@cypress/react';
import ExampleForm from './';
import AppProvider from 'app/AppProvider';

function mountForm() {
  cy.viewport(600, 800);
  const handleSubmit = cy.stub();
  cy.wrap(handleSubmit).as('handleSubmit');
  mount(
    <AppProvider>
      <ExampleForm onSubmit={handleSubmit} />
    </AppProvider>
  );
}

function fillOutForm() {
  cy.get('#firstname').type('John');
  cy.get('#rock-n-roll').check();
  cy.get('#wish-1').clear().type('drink');
  cy.get('#add-wish').click();
  cy.get('#wish-2').clear().type('sleep');
}

describe('Submit button behavior', () => {

  beforeEach(() => {
    mountForm();
  });

  it('Submit button should be enabled if there were no submissions', () => {
    cy.get('#submit').then(el => {
      expect(el.prop('disabled')).to.be.false;
    });
  });

  it('Submit button should be disabled if there are validation errors', () => {
    cy.get('#submit').click().then(el => {
      expect(el.prop('disabled')).to.be.true;
    });
  });

  it('Submit button should be enabled if there are no validation errors', () => {
    cy.get('#submit').click();
    fillOutForm();
    cy.get('#submit').then(el => {
      expect(el.prop('disabled')).to.be.false;
    });
  });

  it('Submit button should not be re-enabled after form reset', () => {
    cy.get('#firstname').type('John');
    cy.get('#submit').click();
    cy.get('#reset').click();
    cy.get('#submit').then(el => {
      expect(el.prop('disabled')).to.be.true;
    });
  });

});

describe('Reset button behavior', () => {

  beforeEach(() => {
    mountForm();
  });

  it('Reset button should be disabled if there was no interaction', () => {
    cy.get('#reset').then(el => {
      expect(el.prop('disabled')).to.be.true;
    });
  });

  it('Reset button should be enabled if there was interaction', () => {
    cy.get('#firstname').type('John');
    cy.get('#reset').then(el => {
      expect(el.prop('disabled')).to.be.false;
    });
  });

});

function getTextFieldErrorMessage(el: JQuery<HTMLElement>) {
  return el.parent().parent().children('.MuiFormHelperText-root.Mui-error')[0];
}

describe('Error message behavior', () => {

  beforeEach(() => {
    mountForm();
  });

  it('Error message should not be displayed until the input is blurred', () => {
    cy.get('#firstname').focus().then(el => {
      const errorEl = getTextFieldErrorMessage(el);
      expect(errorEl).to.be.undefined;
    });
  });

  it('Error message should be displayed after blurring the input', () => {
    cy.get('#firstname').focus().blur().then(el => {
      const errorEl = getTextFieldErrorMessage(el);
      expect(errorEl).not.to.be.undefined;
    });
  });

  it('Error message should be displayed after attempting to submit the form', () => {
    cy.get('#submit').click();
    cy.get('#firstname').then(el => {
      const errorEl = getTextFieldErrorMessage(el);
      expect(errorEl).not.to.be.undefined;
    });
  });

});

describe('Submission behavior', () => {

  beforeEach(() => {
    mountForm();
  });

  it('Submit handler should not be called if there are validation errors', () => {
    cy.get('#submit').click().then(() => {
      cy.get('@handleSubmit').then(handleSubmit => {
        expect(handleSubmit).not.to.be.called;
      });
    });
  });

  it('Submit handler should be called with the entered values', () => {
    fillOutForm();
    cy.get('#submit').click().then(() => {
      // cy.get('@handleSubmit').then(handleSubmit => {
      //   expect(handleSubmit).to.be.calledWith({
      //     firstname: 'John',
      //     lastname: 'Cooper',
      //     gender: 'male',
      //     badHabbits: ['rock-n-roll'],
      //     wishlist: ['eat', 'drink', 'sleep']
      //   });
      // });
      cy.get<Cypress.Agent<sinon.SinonStub>>('@handleSubmit').then((handleSubmit) => {
        const values = handleSubmit.getCall(0).args[0];
        // @ts-ignore
        cy.wrap(values).snapshot();
        // cy.wrap(values).toMatchSnapshot();
      });
    });
  });

  it('Submission errors should be displayed', () => {
    fillOutForm();
    cy.get('#submit').click().then(() => {
      cy.get('#firstname').then(el => {
        const errorEl = getTextFieldErrorMessage(el);
        expect(errorEl).not.to.be.undefined;
      });
      cy.get('#form-error').then(el => {
        expect(el).not.to.be.undefined;
      })
    });
  });

});