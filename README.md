# bookshelf-slug
[![Build Status](https://travis-ci.org/oscaroox/bookshelf-slug.svg?branch=master)](https://travis-ci.org/oscaroox/bookshelf-slug.svg?branch=master)


Automatically generate slugs for your models

### Installation

```javascript
let knex = require('knex')(require('./knexfile.js'))
let bookshelf = require('bookshelf')(knex)

// Add the plugin
bookshelf.plugin(require('bookshelf-slug'))

// Enable it on your models
let User = bookshelf.Model.extend({
  tableName: 'user',

  // setup 1 default column is 'slug'
  slug: ['firstName', 'lastName', 'nickName'] ,

  // or setup 2 override default column
  slug: {
    column: 'uniqueField',
    items: ['firstName', 'lastName', 'nickName']
  }
})
```

### Example
```javascript
 User.forge({
  firstName: 'Theodore',
  lastName: 'Douglas',
  nickName: 'One true god'
 })
 .save()
 .then(model => {
  console.log(model.get('slug')) // theodore-douglas-one-true-god
 })
```

### Testing

```bash
git@github.com:oscaroox/bookshelf-slug.git
cd bookshelf-slug
npm install && npm test
```
