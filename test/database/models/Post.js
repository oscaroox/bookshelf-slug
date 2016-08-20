'use strict';
let bookshelf = require('../').bookshelf;
 require('./User');

module.exports = bookshelf.model('Post', {
  tableName: 'post',
  slug: ['title', 'description'],
  user: function() {
    return this.belongsTo('User');
  }
});
