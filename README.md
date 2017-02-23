# koa-generic-session-knex

[![npm version](https://badge.fury.io/js/koa-generic-session-knex.svg)](https://badge.fury.io/js/koa-generic-session-knex)

Store Koa sessions in a database using knex.

## Usage

This session storage provider works with [koa-generic-session](https://github.com/koajs/generic-session) (session middleware for Koa) and with [koa-session-minimal](https://github.com/longztian/koa-session-minimal) (session middleware for Koa 2).

It stores session data in a database defined by you, using the [Knex](http://knexjs.org/) query builder.

It has been tested with SQLite and PostgreSQL.

Forked and modified from [koa-generic-session-sequelize](https://github.com/natesilva/koa-generic-session-sequelize).

### Installation

`npm install --save koa-generic-session-knex`

### Example

Full example in [examples/basic_sqlite.js](examples/basic_sqlite.js).

```js
const KnexStore = require('koa-generic-session-knex');

// set up Knex in the usual manner
// for a quick example using the sqlite3 module:
const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: "./mydb.sqlite"
  }
});

app.use(session({
  store: new KnexStore(
    knex,            // pass your knex object as the first arg
    {}                    // pass any config options for knexStore as the second arg (see below)
  )
}));
```

### Options

 - `tableName` - Name of the session table in the db (default: `Sessions`)
 - `sync` - Create the sessions table if it doesn’t exist (default: `true`)
 - `syncTimeout` - If `sync` is `true`, how long to wait, in ms, for the sync to complete (default: `3000`)
 - `gcFrequency` - Do garbage collection after approximately this many requests. This deletes expired session data from the table. Set to `0` to never do garbage collection. (default: `10000`, or approximately every 10,000 requests)
 - `timestamps` - If true, the table will have `updated_at` and `created_at` columns. (default: `false`)
 - `browserSessionLifetime` - How long, in ms, to remember sessions without a TTL: sessions that only last until the browser is closed. Some session managers, including `koa-session-minimal`, will ignore this and use a reasonable default. (default: `86400000`)


### Unit tests

To run the test suite, clone this repository and run `npm install` in the checkout directory. Then run `npm test`. This will exercise the library against SQLite.

To test against MySQL, PostgreSQL, or SQL Server, edit `test/config.js`. Uncomment sections referencing those servers and enter your credentials. The table `_sess_test` will be created during testing.
