

module.exports = {
  development: {
    // use_env_variable: "DATABASE_URL",
    username: "root",
    password: "21012001ltv",
    database: "shopapp_online",
    host: "127.0.0.1",
    dialect: "mysql",
    port: 3306,
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    // use_env_variable: "DATABASE_URL",
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};


