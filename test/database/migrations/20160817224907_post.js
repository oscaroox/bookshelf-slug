exports.up = function(knex, Promise) {
  return knex.schema.createTable('post', function(table) {
    table.increments();
    table.string('title').notNullable();
    table.string('description').notNullable();
    table.string('slug').notNullable().unique();
    table.text('content').notNullable();
    table.dateTime('posted_on');
    table.dateTime('updated_on');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('post');
};
