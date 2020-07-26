import Knex from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("post", function (table) {
    table.increments();
    table.integer("user_id").references("user.id").nullable();
    table.string("title").nullable();
    table.string("description").nullable();
    table.string("slug").nullable();
    table.string("second_slug").nullable();
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("post");
}
