'use strict';
let bookshelf = require('../').bookshelf;

module.exports = bookshelf.Model.extend({
  tableName: 'user',
  slug: {
    column: 'uniqueName',
    items: ['firstName', 'lastName', 'nickName']
  }
});
