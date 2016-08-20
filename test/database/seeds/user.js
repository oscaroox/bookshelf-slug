
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('user').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('user').insert({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          nickName: 'D',
          dob: new Date(),
          uniqueName: 'john-doe-d'
        }),
      ]);
    });
};
