// database configuration for unit tests

'use strict';

const tmp = require('tmp');

const config = {};
module.exports = config;

// SQLite -- doesn’t require a server and should always work

config.sqlite = {
  logging: false,
  dialect: 'sqlite',
  storage: tmp.tmpNameSync(),   // create a temp file for SQLite testing
  deleteAfterTests: true        // and delete that temp file after testing
};
config.sqlite = {
  client: 'sqlite3',
  connection: {
    filename: tmp.tmpNameSync()
  }
};

// Uncomment and edit any of the following to test against those DBs:

// config.postgres = {
//        client: "pg",
//        connection: {
//            charset: "utf8",
//            database: "<POSTGRES DB NAME>",
//            host: "<POSTGRES HOST NAME>",
//            password: "<POSTGRES PASSWORD NAME>",
//            user: "<POSTGRES USER NAME>",
//        }
//    };

