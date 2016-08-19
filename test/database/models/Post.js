'use strict';
let bookshelf = require('../').bookshelf;
let User = require('./User');

module.exports = bookshelf.Model.extend({
  tableName: 'post',
  slug: ['title', 'description'],
  user: function() {
    this.belgongsTo(User);
  }
});
