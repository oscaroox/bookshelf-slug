import config from "./knexfile";
import Knex from "knex";
import Bookshelf from "bookshelf";
import bookshelfSlug from "../../lib/plugin";

export const knex = Knex(config);
export const bookshelf = Bookshelf(knex as any);

bookshelf.plugin(bookshelfSlug);
