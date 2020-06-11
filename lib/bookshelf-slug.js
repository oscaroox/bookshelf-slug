'use strict';
let slug = require('slug');

module.exports = function(bookshelf, settings) {
  let Model = bookshelf.Model;
  bookshelf.Model = bookshelf.Model.extend({

    slug: null,
    __slug: {},
    __transacting: null,
    constructor: function() {
      Model.apply(this, arguments);
      if(!this.slug) {
        return;
      }

      if(Array.isArray(this.slug)) {
        if(this.slug.length < 1) {
          throw new Error('slug property should contain atleast one value in array');
        }
        this.__slug.column = 'slug';
        this.__slug.items = this.slug;
      } else if (!Array.isArray(this.slug)) {
        if(!this.slug.column || !this.slug.items) {
          throw new Error('Slug property should be a object and contain a items and column property');
        } else if (this.slug.items.length < 1) {
          throw new Error('items property should atleast contain one value in array');
        }
        this.__slug = this.slug;
      }
      this.on('saving', this.__start);
    },

    __start: function(model, attrs, options) {
      let fields = this.__slug.items;
      let idAttribute = this.idAttribute
      this.__transacting = options && options.transacting;
      if(!model.isNew()) {
        let changed = false;
        for(let idx in fields) {
          if(model.hasChanged(fields[idx])) {
            changed = true;
          }
        }
        if(!changed) {
          return null;
        }

        return this.constructor.forge({[idAttribute]: model.get(idAttribute)})
          .fetch({ transacting: this.__transacting })
          .then(s => {
            let changedValues = Object.assign({}, s ? s.toJSON() : {}, attrs);
            let slugValue = this.__generateSlug(changedValues);

            return this.__beginSlug(slugValue);
          });
      }

      return this.__beginSlug(this.__generateSlug());
    },

    __generateSlug: function(changed) {
      let values = this.__slug.items.map(field => {
        if(changed && changed[field]) {
          return changed[field];
        }
        return this.get(field)
      }).join(' ');
      return slug(values, {lower: true});
    },

    __beginSlug: function(value) {
      return this.__checkSlug(value)
        .then(isUnique => {
            if(isUnique) {
              return this.set(this.__slug.column, value);
            }
            return this.__incrementSlug(value);
        });
    },

    __incrementSlug: function(value) {
      var inc = (newSlug, count) => {
        newSlug = newSlug + '-' + Date.now() +'-'+ count;
        return this.__checkSlug(newSlug, this.__slug.column)
          .then(isUnique => {
            if(isUnique) {
              return this.set(this.__slug.column, newSlug);
            }
            return inc(newSlug, count + 1);
          });
      }
      return inc(value, ~~(Math.random() * 6500) + 1000);
    },

    __checkSlug: function(slugToCheck) {
      return this.constructor.forge()
       .where(this.__slug.column, slugToCheck)
       .fetch({ transacting: this.__transacting })
       .then(entity => {
         return entity === null;
       });
    }
  })
}
