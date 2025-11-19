import 'dotenv/config';

export default {
  apps: [
    {
      name: 'shopapp-online',
      script: './dist/index.js', // file đã build
      interpreter: 'node',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
