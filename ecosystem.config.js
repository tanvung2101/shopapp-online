import dotenv from 'dotenv'
dotenv.config()


export default {
    apps: [
      {
        name: 'shopapp-online',
        script: './index.js', // ✅ nếu index.js nằm ở thư mục gốc
        env: {
          AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
          BUCKET_NAME: process.env.BUCKET_NAME,
          CLIENT_URL: process.env.CLIENT_URL,
          AWS_REGION: process.env.AWS_REGION,
          SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS,
          PORT: 5000,
          NODE_ENV: process.env.NODE_ENV
        }
      }
    ]
  }
  