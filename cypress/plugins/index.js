/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// /**
//  * @type {Cypress.PluginConfig}
//  */
// // eslint-disable-next-line no-unused-vars
// module.exports = (on, config) => {
//   // `on` is used to hook into various events Cypress emits
//   // `config` is the resolved Cypress config
// }

const path = require('path')
const indectDevServer = require('@cypress/react/plugins/load-webpack');
// const { initPlugin } = require('cypress-plugin-snapshots/plugin');

module.exports = (on, config) => {

  const webpackFilename = path.resolve(__dirname, '../webpack.config.js');
  indectDevServer(on, config, { webpackFilename });

  // initPlugin(on, config);

  return config;
}