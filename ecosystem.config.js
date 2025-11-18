import dotenv from 'dotenv';
dotenv.config();

export default {
  apps: [
    {
      name: 'shopapp-online',
      script: './dist/index.js', // file entry
      watch: false,
      env: {
        NODE_ENV: 'development',
        DB_DEV_USERNAME: process.env.DB_DEV_USERNAME,
        DB_DEV_PASSWORD: process.env.DB_DEV_PASSWORD,
        DB_DEV_DATABASE: process.env.DB_DEV_DATABASE,
        DB_DEV_HOST: process.env.DB_DEV_HOST,
        DB_DEV_PORT: process.env.DB_DEV_PORT,
        DB_DEV_DIALECT: process.env.DB_DEV_DIALECT,
      },
      env_production: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
      },
    },
  ],
};
