// models/index.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

// ✅ Sequelize config chuẩn Railway
const sequelize = new Sequelize(
  process.env.DB_DATABASE,           // tên database
  process.env.DB_USERNAME,           // username
  process.env.DB_PASSWORD,           // password
  {
    host: process.env.DB_HOST || "hopper.proxy.rlwy.net",  // public host Railway
    port: Number(process.env.DB_PORT) || 21534,            // port Railway
    dialect: process.env.DB_DIALECT || "mysql",            // mysql
    dialectOptions: {
      ssl: { rejectUnauthorized: false }                  // Railway yêu cầu SSL
    },
    logging: false,  // tắt log query
  }
);

const db = {};

// Load tất cả model trong folder (trừ index.js)
const modelFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"));

for (const file of modelFiles) {
  const modulePath = path.join(__dirname, file);
  const modelModule = await import(modulePath);
  const modelFn = modelModule.default || modelModule;
  const model = modelFn(sequelize, DataTypes);
  db[model.name] = model;
}

// Setup associations nếu có
Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
