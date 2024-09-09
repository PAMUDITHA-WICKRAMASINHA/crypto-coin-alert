import mongoose from "mongoose";
import logger from "../logger";

const URI = `mongodb://${process.env.DATABASE_USER}:${encodeURIComponent(
  process.env.DATABASE_PASSWORD || ""
)}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/admin`;

const connection = mongoose
  .createConnection(URI, {
    autoIndex: false,
  })
  .useDb(process.env.DATABASE || "", { useCache: true, noListener: true });

connection.on("open", async () => {
  logger.info("🔌️ Database Connection has been established successfully!");
});

connection.on("error", (err) => {
  logger.error(err);
  process.exit(1);
});

export default connection;
