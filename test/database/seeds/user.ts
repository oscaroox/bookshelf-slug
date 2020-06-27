import Knex from "knex";

exports.seed = function (knex: Knex) {
  // Deletes ALL existing entries
  return knex("user").del()
    .then(function () {
      // Inserts seed entries
      return knex("user").insert({
        id: 1,
        firstName: "John",
        lastName: "Doe",
        nickName: "D",
        dob: new Date(),
        uniqueName: "john-doe-d",
      });
    });
};
