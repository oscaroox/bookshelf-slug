exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', function(table) {
    table.increments();
    table.string('firstName').notNullable();
    table.string('lastName').notNullable();
    table.string('nickName').notNullable();
    table.dateTime('dob').notNullable();
    table.string('uniqueName').notNullable().unique();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user');
};
