import Bookshelf from "bookshelf";

export type SlugOption = {
  column: string;
  items: string[];
  unique: boolean;
  update: boolean;
};

export type PluginSettings = {
  replacement?: string;
  remove?: RegExp;
  lower?: boolean;
  strict?: boolean;
  locale?: string;
  generateId?: () => string;
};

export type KnexTransaction = Bookshelf.SyncOptions["transacting"];

export type Mappable = { [k: string]: string };

export type SlugModel = Bookshelf.Model<any> & {
  slug: string | SlugOption;
  slugOptions: SlugOption;
  activateSlugPlugin(
    model: Bookshelf.Model<any>,
    attrs: {},
    options: { transacting?: KnexTransaction }
  ): any;
  generateSlug(changedValue?: Mappable): string;
  setSlug(value: string, transacting?: KnexTransaction): Promise<string>;
  checkSlug(value: string, transacting?: KnexTransaction): Promise<boolean>;
};
