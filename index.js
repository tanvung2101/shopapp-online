
/**
 * docker exec -it mysql_container mysql -uroot -p
 * npx sequelize-cli model:generate --name User --attributes email:string,passowrd:string,name:string,role:integer,avatar:string,phone:integer,created_at:date,deleted_at:date
npx sequelize-cli model:generate --name News --attributes title:string,image:text,content:text
npx sequelize-cli model:generate --name Banner --attributes name:string,image:text,status:integer
npx sequelize-cli model:generate --name Order --attributes user_id:integer,status:integer,note:text,total:integer
npx sequelize-cli model:generate --name Product --attributes name:string,price:integer,oldprice:integer,image:text,description:text,specification:text,buyturn:integer,quantity:integer,brand_id:integer,category_id:integer
npx sequelize-cli model:generate --name OrderDetail --attributes order_id:integer,product_id:integer,price:integer,quantity:integer
npx sequelize-cli model:generate --name BannerDetail --attributes product_id:integer,banner_id:integer
npx sequelize-cli model:generate --name Feedback --attributes product_id:integer,user_id:integer,star:integer,content:text
npx sequelize-cli model:generate --name NewsDetail --attributes product_id:integer,new_id:integer
npx sequelize-cli model:generate --name ProductImage --attributes product_id:integer,image_url:text
npx sequelize-cli model:generate --name Cart --attributes session_id:string,user_id:integer
npx sequelize-cli model:generate --name CartItem --attributes cart_id:integer,product_id:integer,quantity:integer
npx sequelize-cli model:generate --name CartItem --attributes cart_id:integer,product_id:integer,quantity:integer
npx sequelize-cli model:generate --name Attribute --attributes name:string
npx sequelize-cli model:generate --name ProductAttributeValue --attributes product_id:integer,attribute_id:integer,value:text
npx sequelize-cli model:generate --name ProductVariantValue --attributes price:decimal(12,2),old_price:decimal(12,2),stock:integer,sku:string


- Run migrate
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo

alter table shopapp_online.orders modify user_id int null;

alter table shopapp_online.users
add column password_changed_at datetime null;
 */

import './config/dotenv.js';
import cookieParser from "cookie-parser";
import express from 'express'
import './helpers/s3.js'

import { AppRoute } from './AppRoute.js';
import db from "./models/index.js";
import { rateLimit } from 'express-rate-limit'


const app = express();
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})
app.use(limiter)


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
// cookie parser
app.use(cookieParser(process.env.JWT_REFRESH_SECRET));


// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Origin",
//       "Content-Type",
//       "X-Requested-With",
//       "Authorization",
//       "Accept",
//     ],
//   })
// );



// Middleware xử lý CORS
app.use((req, res, next) => {
  // res.header("Access-Control-Allow-Origin", "https://shopapp-online.vercel.app");
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, X-Requested-With, Authorization, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Trả về 200 ngay nếu request là OPTIONS (preflight request)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});


app.get("/health", async (req, res) => {
  try {
    await db.sequelize.authenticate(); // Kiểm tra kết nối database
    console.log('hello')
    res
      .status(200)
      .json({
        server: "UP",
        database: "UP",
        timestamp: new Date().toISOString(),
      });
  } catch (error) {
    console.error("Database connection error:", error);
    res
      .status(500)
      .json({ server: "UP", database: "DOWN", error: error.message });
  }
});

AppRoute(app)

const port = process?.env?.PORT || 5000
app.listen(port, () => {
  try {
  } catch (error) {
  }
  console.log(`Example app listening on port ${port}`);
});

// video7 1608 