/* global describe, after */

'use strict';

const fs = require('fs');
const commonTests = require('./commonTests');
const ourTests = require('./ourTests');
const config = require('./config');
const Knex = require('knex');
const KnexStore = require('../index.js');

describe('test/allTests.js', function () {
  if (config.sqlite && config.sqlite.deleteAfterTests) {
    after(function () {
      this.timeout(5000);               // eslint-disable-line no-invalid-this
      // give SQLite time to release its lock on the file, then delete it
      setTimeout(function () {
        if (fs.existsSync(config.sqlite.storage)) {
          try {
            fs.unlinkSync(config.sqlite.storage);
          } catch (err) {
            // ignore: on Windows we sometimes can't unlink the temp file
          }
        }
      }, 2000);
    });
  }

  // run the test suites once for each db engine
  Object.keys(config).forEach(function (dbengine) {
    describe(dbengine, function () {
      const knex = Knex(config[dbengine]);
      const store = new KnexStore(knex, { sync: true, tableName: '_sess_test' });

      after(function () {
        knex.destroy();
      });

      commonTests(store);
      ourTests(store, knex);
    });
  });
});
