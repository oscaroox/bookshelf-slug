import Knex from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("articles", function (table) {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.string("slug").notNullable().unique();
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("articles");
}
