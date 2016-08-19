'use strict';
let slug = require('slug');

module.exports = function(bookshelf, settings) {

  let proto = bookshelf.Model.prototype;

  let insert = function(slugOptions, model, attrs, options) {
    let column = slugOptions.column;
    let slugFields = slugOptions.items;
    let slugValue = generateSlug(model, slugFields);
    return beginSlug.call(this, slugValue, column, model);
  }

  let update = function(slugOptions, model, attrs, options) {
    let column = slugOptions.column;
    let slugFields = slugOptions.items;
    let changed = false;
    for(let idx in slugFields) {
      if(attrs.hasOwnProperty(slugFields[idx])) {
        changed = true;
      }
    }
    if(!changed) return;

    return this.constructor.forge({id: model.get('id')})
      .fetch()
      .then(s => {
        let obj = Object.assign({}, s.toJSON(), attrs);
        let slugValue = generateSlug(model, slugFields, obj);
        return beginSlug.call(this, slugValue, column, model)
      });
  }

  function beginSlug(slugValue, column, model) {
    return checkSlug.call(this, slugValue, column)
      .then(isUnique => {
          if(isUnique) {
            return model.set(column, slugValue);
          }
          return incrementSlug.call(this, model, slugValue, column);
      });
  }
  function incrementSlug(source, slug, column) {
    return (function inc(src, slg, column, count) {
      let newSlug = slg + '-' + Date.now() +'-'+ count;

      return checkSlug.call(this, newSlug, column)
        .then(isUnique => {
          if(isUnique) {
            return src.set(column, newSlug);
          }
          return inc.call(this, src, slg, column, count + 1);
        })
    }).call(this, source, slug, column, ~~(Math.random() * 6500) + 1000)
  }
  function generateSlug(source, slugFields, attrs) {
    let values = slugFields.map(field => {
      if(attrs && attrs[field]) {
        return attrs[field];
      }
      return source.get(field)
    }).join(' ');
    return slug(values, {lower: true});
  }
  function checkSlug(slug, column) {
    return this.constructor.forge()
      .query(qb => {
        qb.where(column, slug)
      })
      .fetch()
      .then(model => {
        return model === null;
      })
  }
  bookshelf.Model = bookshelf.Model.extend({

    slug: null,
    slugPrefix: null,

    initialize: function() {
      proto.initialize.call(this, arguments);
      if(!this.slug) {
        return;
      }
      let slugOptions = {};


      if(Array.isArray(this.slug)) {
        if(this.slug.length < 1) {
          throw new Error('slug property should contain atleast one value');
        }
        slugOptions.column = 'slug';
        slugOptions.items = this.slug;
      } else if (!Array.isArray(this.slug)) {
        if(!this.slug.column || !this.slug.items) {
          throw new Error('column property should not be empty');
        }
        slugOptions = this.slug;
      }
      this.on('creating', insert.bind(this, slugOptions));
      this.on('updating', update.bind(this, slugOptions));
    }
  })
}
