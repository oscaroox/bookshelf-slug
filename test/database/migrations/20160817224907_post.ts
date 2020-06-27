import Knex from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("post", function (table) {
    table.increments();
    table.integer("user_id").references("user.id").notNullable();
    table.string("title").notNullable();
    table.string("description").notNullable();
    table.string("slug").notNullable().unique();
    table.text("content").notNullable();
    table.dateTime("posted_on");
    table.dateTime("updated_on");
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("post");
}
