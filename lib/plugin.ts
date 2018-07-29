import Bookshelf from "bookshelf";
import { Transaction } from "knex";
import slugify from "slugify";

interface SlugOption {
  column: string;
  items: string[];
  idAttribute: string;
}

export default function bookshelfSlug(bookshelf: Bookshelf): void {
  bookshelf.Model = bookshelf.Model.extend({
    __slug: {},
    __transacting: null,
    slug: undefined,

    constructor() {
      bookshelf.Model.apply(this, arguments);
      if (!this.slug) {
        return;
      }

      let slug: SlugOption = {
        column: "",
        items: [],
        idAttribute: this.idAttribute
      };

      if (Array.isArray(this.slug)) {
        if (this.slug.length < 1) {
          throw new Error(
            "slug property should contain atleast one value in array"
          );
        }
        slug.column = "slug";
        slug.items = this.slug;
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
        slug = {
          ...slug,
          ...this.slug
        };
      }

      this.on("saving", (model: Bookshelf.Model<any>, attrs: {}, opts: {}) => {
        return activate(bookshelf.Model, slug, model, attrs, opts);
      });
    }
  }) as typeof Bookshelf.Model;
}

async function activate(
  bookshelf: typeof Bookshelf.Model,
  slug: SlugOption,
  model: Bookshelf.Model<any>,
  attrs: {},
  options: { transacting?: Transaction }
) {
  const fields = slug.items;
  const idAttribute = slug.idAttribute;
  const column = slug.column;
  const transacting = options && options.transacting;

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

    const res = await new bookshelf({
      [idAttribute]: model.get(idAttribute)
    }).fetch({
      transacting
    });

    const changedValues = Object.assign({}, res ? res.toJSON() : {}, attrs);
    const newSlug = generateSlug(slug, model, changedValues);
  }
}

function generateSlug(
  slug: SlugOption,
  model: Bookshelf.Model<any>,
  changed: any
) {
  const values = slug.items
    .map(field => {
      if (changed && changed[field]) {
        return changed[field];
      }
      return model.get(field);
    })
    .join(" ");

  return slugify(values, { lower: true });
}
