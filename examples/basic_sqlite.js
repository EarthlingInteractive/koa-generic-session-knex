const session = require('koa-generic-session');
const Knex = require('knex');
const KnexStore = require('..');
const koa = require('koa');

// set up Knex in the usual manner, or, for a quick example:
const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: "./example.db"
  }
});

const app = koa();
app.keys = ['keys', 'keykeys'];
app.use(session({
  store: new KnexStore(
    knex,            // pass your knex object as the first arg
    {}                    // pass any config options for KnexStore as the second arg
  )
}));

function get() {
  const session = this.session;
  session.count = session.count || 0;
  session.count++;
  this.body = session.count;
}

function remove() {
  this.session = null;
  this.body = 0;
}

function *regenerate() {
  get.call(this);
  yield this.regenerateSession();
  get.call(this);
}

app.use(function *() {
  switch (this.path) {
  case '/get':
    get.call(this);
    break;
  case '/remove':
    remove.call(this);
    break;
  case '/regenerate':
    yield regenerate.call(this);
    break;
  }
});

app.listen(8080);
