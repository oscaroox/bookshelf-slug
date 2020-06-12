exports.up = function(knex) {
  return knex.schema.createTable('articles', function(table) {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.string('slug').notNullable().unique();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('articles');
};
