import { mount } from '@cypress/react';

function Example() {
  return (
    <div id="title">Learn Cypress</div>
  );
}

describe('Example', () => {
  it('renders example component', () => {
    mount(<Example />);
    cy.get('#title').contains('Learn Cypress');
  })
})