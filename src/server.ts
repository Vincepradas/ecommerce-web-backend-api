import * as dotenv from 'dotenv';
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

(async () => {
  try {
    await connectDB();

    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
