import Bookshelf from "bookshelf";
import { Transaction } from "knex";
import slugify from "slugify";

interface SlugOption {
  column: string;
  items: string[];
}

export default function bookshelfSlug(bookshelf: Bookshelf): void {
  bookshelf.Model = bookshelf.Model.extend({
    __transacting: undefined,

    slugOptions: {
      column: "",
      items: []
    },

    slug: undefined,

    constructor() {
      bookshelf.Model.apply(this, arguments);
      if (!this.slug) {
        return;
      }

      if (Array.isArray(this.slug)) {
        if (this.slug.length < 1) {
          throw new Error(
            "slug property should contain atleast one value in array"
          );
        }
        this.slugOptions.column = "slug";
        this.slugOptions.items = this.slug;
      } else if (!Array.isArray(this.slug)) {
        if (!this.slug.column || !this.slug.items) {
          throw new Error(
            "Slug property should be a object and contain a items and column property"
          );
        } else if (this.slug.items.length < 1) {
          throw new Error(
            "items property should atleast contain one value in array"
          );
        }

        this.slugOptions = this.slug;
      }

      this.on("saving", this.activateSlugPlugin.bind(this));
    },

    async activateSlugPlugin(
      model: Bookshelf.Model<any>,
      attrs: {},
      options: { transacting?: Transaction }
    ) {
      const slugOptions: SlugOption = this.slugOptions;
      const fields = slugOptions.items;
      const idAttribute = this.idAttribute;
      this.__transacting = options && options.transacting;

      if (!model.isNew()) {
        let changed = false;
        for (const field of fields) {
          if (attrs.hasOwnProperty(field)) {
            changed = true;
          }
        }

        if (!changed) {
          return;
        }

        const res = await new (this.constructor as typeof Bookshelf.Model)({
          [idAttribute]: model.get(idAttribute)
        }).fetch({
          transacting: this.__transacting
        });

        const changedValues = Object.assign({}, res ? res.toJSON() : {}, attrs);
        const newSlug = this.generateSlug(model, changedValues);
        return this.setSlug(newSlug);
      }

      const slugValue: string = this.generateSlug();

      return this.setSlug(slugValue);
    },

    async setSlug(value: string) {
      const isUnique: boolean = this.checkSlug(value);
      const slugOptions: SlugOption = this.slugOptions;

      if (isUnique) {
        return this.set(slugOptions.column, value);
      }

      const newSlug = `${value}-${Date.now()}`;

      return this.setSlug(newSlug);
    },

    generateSlug(changed?: any) {
      const values = (this.slugOptions as SlugOption).items
        .map(field => {
          if (changed && changed[field]) {
            return changed[field];
          }
          return this.get(field);
        })
        .join(" ");

      return slugify(values, { lower: true });
    },

    async checkSlug(slugToCheck: string): Promise<boolean> {
      const Model: typeof Bookshelf.Model = this.constructor;
      const slugOptions: SlugOption = this.slugOptions;

      const entity = await new Model()
        .where(slugOptions.column, slugToCheck)
        .fetch({ transacting: this.__transacting });

      return entity === null || entity === undefined;
    }
  }) as typeof Bookshelf.Model;
}
