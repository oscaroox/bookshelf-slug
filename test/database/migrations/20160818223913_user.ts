import Knex from "knex";
export function up(knex: Knex) {
  return knex.schema.createTable("user", function (table) {
    table.increments();
    table.string("firstName").notNullable();
    table.string("lastName").notNullable();
    table.string("nickName").notNullable();
    table.dateTime("dob").notNullable();
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("user");
}
