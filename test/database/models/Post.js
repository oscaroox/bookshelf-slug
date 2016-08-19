'use strict';
let bookshelf = require('../').bookshelf;

module.exports = bookshelf.Model.extend({
  tableName: 'post',
  slug: ['title', 'description']
});
