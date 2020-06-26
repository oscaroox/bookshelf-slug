export default {
  client: "sqlite3",
  connection: {
    filename: __dirname + "/db.sqlite",
  },
  useNullAsDefault: true,
  migrations: {
    directory: __dirname + "/migrations",
  },
};
