'use strict';
let bookshelf = require('../').bookshelf;
require('./Post.js');

module.exports = bookshelf.model('User', {
  tableName: 'user',
  slug: {
    column: 'uniqueName',
    items: ['firstName', 'lastName', 'nickName']
  },
  post: function() {
    return this.hasMany('Post');
  }
});
