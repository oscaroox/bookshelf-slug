import { SlugModel, SlugOption, KnexTransaction, Mappable } from "./interfaces";
import Bookshelf from "bookshelf";
import slugify from "slugify";

export default function bookshelfSlug(bookshelf: Bookshelf): void {
  const proto = bookshelf.Model.prototype;
  bookshelf.Model = bookshelf.Model.extend({
    __transacting: undefined,

    slugOptions: {
      column: "",
      items: [],
      unique: true,
      update: true,
    },

    slug: undefined,

    constructor() {
      const that = this as SlugModel;
      proto.constructor.apply(that, arguments);
      if (!that.slug) {
        return;
      }

      if (Array.isArray(that.slug)) {
        that.slugOptions.column = "slug";
        that.slugOptions.items = this.slug;
      } else if (typeof that.slug === "object") {
        that.slugOptions = { ...that.slug };
      }

      that.on("saving", that.activateSlugPlugin.bind(that));
    },

    async activateSlugPlugin(
      this: SlugModel,
      model: Bookshelf.Model<any>,
      attrs: {},
      options: { transacting?: KnexTransaction },
    ) {
      const slugOptions: SlugOption = this.slugOptions;
      const fields = slugOptions.items;
      const idAttribute = this.idAttribute;
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

        const res = await new (this.constructor as typeof Bookshelf.Model)({
          [idAttribute]: model.get(idAttribute),
        }).fetch({
          transacting: transacting,
        });

        const changedValues = Object.assign({}, res ? res.toJSON() : {}, attrs);
        const newSlug = this.generateSlug(changedValues);
        return this.setSlug(newSlug);
      }

      const slugValue: string = this.generateSlug();

      return this.setSlug(slugValue);
    },

    async setSlug(
      this: SlugModel,
      value: string,
      transacting: KnexTransaction,
    ) {
      const isUnique: boolean = await this.checkSlug(value, transacting);
      const slugOptions: SlugOption = this.slugOptions;

      if (isUnique) {
        return this.set(slugOptions.column, value);
      }

      const newSlug = `${value}-${Date.now()}`;

      return this.setSlug(newSlug);
    },

    generateSlug(this: SlugModel, changed?: Mappable) {
      const values = this.slugOptions.items
        .map((field) => {
          if (changed && changed[field]) {
            return changed[field];
          }
          return this.get(field);
        })
        .join(" ");

      return slugify(values, { lower: true });
    },

    async checkSlug(
      this: SlugModel,
      slugToCheck: string,
      transacting?: KnexTransaction,
    ): Promise<boolean> {
      const Model = this.constructor as typeof Bookshelf.Model;

      const entity = await new Model()
        .where(this.slugOptions.column, slugToCheck)
        .fetch({ transacting });

      return entity === null || entity === undefined;
    },
  }) as typeof Bookshelf.Model;
}
