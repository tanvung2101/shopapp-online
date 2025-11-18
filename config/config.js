import dotenv from 'dotenv';
dotenv.config();

const parsePort = (value) => {
  const port = parseInt(value, 10);
  return isNaN(port) ? undefined : port;
};

export default {
  development: {
    username: process.env.DB_DEV_USERNAME || 'root',
    password: process.env.DB_DEV_PASSWORD || null,
    database: process.env.DB_DEV_DATABASE || 'database_dev',
    host: process.env.DB_DEV_HOST || '127.0.0.1',
    dialect: process.env.DB_DEV_DIALECT || 'mysql',
    port: parsePort(process.env.DB_DEV_PORT) || 3306,
  },
  test: {
    username: process.env.DB_TEST_USERNAME || 'root',
    password: process.env.DB_TEST_PASSWORD || null,
    database: process.env.DB_TEST_DATABASE || 'database_test',
    host: process.env.DB_TEST_HOST || '127.0.0.1',
    dialect: process.env.DB_TEST_DIALECT || 'mysql',
    port: parsePort(process.env.DB_TEST_PORT) || 3306,
  },
  production: {
    // Nếu có DATABASE_URL thì dùng, nếu không thì fallback các biến riêng
    username: process.env.DB_PROD_USERNAME || 'root',
    password: process.env.DB_PROD_PASSWORD || null,
    database: process.env.DB_PROD_DATABASE || 'database_production',
    host: process.env.DB_PROD_HOST || '127.0.0.1',
    dialect: process.env.DB_PROD_DIALECT || 'mysql',
    port: parsePort(process.env.DB_PROD_PORT) || 3306,
    ...(process.env.DATABASE_URL ? { use_env_variable: 'DATABASE_URL' } : {}),
  },
};
