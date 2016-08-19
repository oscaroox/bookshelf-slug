'use strict';
let bookshelf = require('../').bookshelf;
let Post = require('./Post');
module.exports = bookshelf.Model.extend({
  tableName: 'user',
  slug: {
    column: 'uniqueName',
    items: ['firstName', 'lastName', 'nickName']
  },
  post: function() {
    return this.hasMany(Post);
  }
});
