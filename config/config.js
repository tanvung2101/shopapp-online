import dotenv from 'dotenv';

dotenv.config();


export default {
  development: {
    username: process.env.DB_DEV_USERNAME,
    password: process.env.DB_DEV_PASSWORD, // Use null if the environment variable is empty
    database: process.env.DB_DEV_DATABASE,
    port: parseInt(process.env.DB_DEV_PORT, 10),
    host: process.env.DB_DEV_HOST,
    dialect: process.env.DB_DEV_DIALECT,
    use_env_variable: "DATABASE_URL",
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    use_env_variable: "DATABASE_URL",
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
