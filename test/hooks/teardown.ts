import { knex } from "../database/index";

after(() => {
  return knex
    .raw("delete from post")
    .then(() => knex.raw("delete from user"))
    .then(() => knex.destroy());
});
