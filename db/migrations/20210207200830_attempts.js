
exports.up = function(knex) {
  return knex.schema.createTable("attempts",(table) => {
      table.increments();
      table.integer("numOfSuccessfulAttempts")
      table.integer("numOfAttempts")
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("attempts")
};
