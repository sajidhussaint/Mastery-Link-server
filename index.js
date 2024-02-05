import dbConnection from "./config/db.js";
import dotenv from "dotenv";
import { httpServer } from "./app.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

dbConnection();

httpServer.listen(PORT, () => {
  console.log(`server running on port http://localhost:${PORT}`);
});
