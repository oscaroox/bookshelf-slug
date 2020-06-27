const knexConfig = {
  client: "sqlite3",
  connection: {
    filename: __dirname + "/db.sqlite",
  },
  useNullAsDefault: true,
  migrations: {
    directory: __dirname + "/migrations",
  },
};

export default knexConfig;
module.exports = knexConfig;
