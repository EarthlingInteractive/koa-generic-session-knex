'use strict';

const EventEmitter = require('events').EventEmitter;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class KnexStore extends EventEmitter {
  constructor(knex, options) {
    super();

    this.knex = knex;

    this.options = Object.assign({
      tableName: 'Sessions',
      sync: true,               // if true, create the table if it doesn’t exist
      syncTimeout: 3000,        // if sync is true, how long to wait for initial sync (ms)
      gcFrequency: 10000,       // do garbage collection approx. every this many requests
      timestamps: false,        // if true, add knex updated_at and created_at columns
      browserSessionLifetime: 86400 * 1000  // how long to remember sessions without a TTL
    }, options || {});

    this.synced = false;

    if (this.options.sync) {
		this.knex.schema.createTableIfNotExists(this.options.tableName, (table) => {
		  table.string('id', 100).primary();
		  table.text('data');
		  table.bigInteger('expires');
		  table.index('expires');
		  if(this.options.timestamps) {
			  table.timestamps();
		  }
		  
		})
		.then(() => {
			this.synced = true;
			this.emit('connect');
		  });
    } else {
      this.synced = true;
      this.emit('connect');
    }
  }

  waitForSync() {
    if (this.synced) { return Promise.resolve(); }

    return new Promise((resolve, reject) => {
      const end = Date.now() + this.options.syncTimeout;
      const timerId = setInterval(() => {
        if (this.synced) {
          clearInterval(timerId);
          return resolve();
        }
        if (Date.now() > end) {
          clearInterval(timerId);
          const errMessage = `could not sync() the ${this.options.modelName} model`;
          return reject(new Error(errMessage));
        }
      }, 100);
    });
  }

  get(sid) {
    return this.waitForSync().then(() => {
      if (this.options.gcFrequency > 0) {
        if (getRandomInt(1, this.options.gcFrequency) === 1) { this.gc(); }
      }
	  
	  return this.knex(this.options.tableName)
	  .where('id', sid)
	  .andWhere('expires', '>', Math.floor(Date.now() / 1000))
	  .limit(1)
	  .then(rows => {
        if (!rows || rows.length === 0) { return null; }
        return JSON.parse(rows[0].data);
      });
    });
  }

  set(sid, sess, ttl) {
    if (!ttl) {
      if (sess.cookie && sess.cookie.maxAge) {
        // standard expiring cookie
        return this.set(sid, sess, sess.cookie.maxAge);
      } else if (this.options.browserSessionLifetime > 0) {
        // browser-session cookie
        return this.set(sid, sess, this.options.browserSessionLifetime);
      }
    }

    return this.waitForSync().then(() => {
      const expires = Math.floor((Date.now() + (Math.max(ttl, 0) || 0)) / 1000);
	  
	  return this.knex(this.options.tableName)
	  .where('id', sid)
	  .then((rows) => {
		  if(rows && rows.length > 0) {
			 return this.knex(this.options.tableName)
			 .where('id', sid)
			 .update({
				 data: JSON.stringify(sess),
				 expires: expires
			 }); 
		  }else {
			  return this.knex(this.options.tableName)
				.insert({
				 id: sid,
				 data: JSON.stringify(sess),
				 expires: expires
			 })
		  } 
	  });
	 
    });
  }

  destroy(sid) {
    return this.waitForSync().then(() => {
	  return this.knex(this.options.tableName)
		.where('id', sid)
		.del();
    });
  }

  gc() {
    return this.waitForSync().then(() => {
		return this.knex(this.options.tableName)
		.where('expires', '<=', Math.floor(Date.now() / 1000))
		.del();
    });
  }
}

module.exports = KnexStore;
