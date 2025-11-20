export default {
  apps: [
    {
      name: "shopapp-online",
      script: "./dist/index.js",
      exec_mode: "fork",
      interpreter: "node",
      watch: false,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
