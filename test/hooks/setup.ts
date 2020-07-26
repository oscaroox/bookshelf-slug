import { knex } from "../database/index";

beforeEach(() => {
  return knex.raw("delete from post").then(() => knex.raw("delete from user"));
});
