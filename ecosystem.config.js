// ecosystem.config.js
import 'dotenv/config';

export default {
  apps: [
    {
      name: 'shopapp-online',
      script: './dist/index.js',
      interpreter: 'node',
      node_args: '--experimental-specifier-resolution=node',
      watch: false,
      env: {
        NODE_ENV: 'development',
        DB_DATABASE: process.env.DB_DEV_DATABASE,
        DB_USERNAME: process.env.DB_DEV_USERNAME,
        DB_PASSWORD: process.env.DB_DEV_PASSWORD,
        DB_HOST: process.env.DB_DEV_HOST,
        DB_PORT: process.env.DB_DEV_PORT,
        DB_DIALECT: process.env.DB_DEV_DIALECT,
      },
      env_production: {
        NODE_ENV: 'production',
        DB_DATABASE: process.env.DB_PROD_DATABASE,
        DB_USERNAME: process.env.DB_PROD_USERNAME,
        DB_PASSWORD: process.env.DB_PROD_PASSWORD,
        DB_HOST: process.env.DB_PROD_HOST,
        DB_PORT: process.env.DB_PROD_PORT,
        DB_DIALECT: process.env.DB_PROD_DIALECT,
      },
    },
  ],
};
