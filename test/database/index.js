'use strict';
let config = require('./knexfile');
let knex = require('knex')(config);
let bookshelf = require('bookshelf')(knex);

bookshelf.plugin('registry');
bookshelf.plugin(require('../../'));

module.exports = {
  bookshelf: bookshelf,
  knex: knex
}
