// database configuration for unit tests

'use strict';

const tmp = require('tmp');

const config = {};
module.exports = config;

// sQLite -- doesn’t require a server and should always work

config.sqlite = {
  client: 'sqlite3',
  connection: {filename: tmp.tmpNameSync()}
};

// uncomment and edit any of the following to test against those DBs:

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

