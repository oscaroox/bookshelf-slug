# bookshelf-slug

![Main workflow](https://github.com/oscaroox/bookshelf-slug/workflows/Main%20workflow/badge.svg)

Automatically generate slugs for your models

### Requirements

- Bookshelfjs 1.x
- Nodejs 10.x, 12.x

### Install

```bash
npm install bookshelf-slug
```

### Setup

```javascript
let knex = require("knex")(require("./knexfile.js"));
let bookshelf = require("bookshelf")(knex);

// Add the plugin
bookshelf.plugin(require("bookshelf-slug"));

// Enable it on your models
let User = bookshelf.Model.extend({
  tableName: "user",

  // setup 1 default column is 'slug'
  slug: ["firstName", "lastName", "nickName"],

  // or setup 2 override default column
  slug: {
    column: "uniqueField",
    items: ["firstName", "lastName", "nickName"],
  },
});
```

### Example

```javascript
User.forge({
  firstName: "Theodore",
  lastName: "Douglas",
  nickName: "theo",
})
  .save()
  .then((model) => {
    console.log(model.get("slug")); // theodore-douglas-theo
  });
```
