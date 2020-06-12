'use strict';
let bookshelf = require('../').bookshelf;

module.exports = bookshelf.model('Article', {
  tableName: 'articles',
  requireFetch: false,
  slug: ['title'],
});
