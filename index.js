
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
npx sequelize-cli migration:generate --name add_session_to_orders
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo

alter table shopapp_online.orders modify user_id int null;
 */
import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import db from './models';


const app = express();
app.use(express.json())
express.urlencoded({ extended: true })

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Cho phép tất cả domain truy cập
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type,X-Requested-With Authorization, Accept");


  next();
});

app.get("/health", async (req, res) => {
  try {
    await db.sequelize.authenticate(); // Kiểm tra kết nối database
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


import { AppRoute } from './AppRoute';

AppRoute(app)
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = process?.env?.PORT ?? 3000
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
