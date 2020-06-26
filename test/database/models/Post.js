'use strict';
let bookshelf = require('../').bookshelf;
 require('./User');

module.exports = bookshelf.model('Post', {
  tableName: 'post',
  requireFetch: false,
  slug: ['title', 'description'],
  user: function() {
    return this.belongsTo('User');
  }
});
