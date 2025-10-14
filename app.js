const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const app = express();
const ViewCount = require("./models/ViewCount");

const corsOptions = {
  origin: "*" || process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const viewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1,
  message: "Same IP detected.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/visit", viewLimiter, async (req, res) => {
  try {
    const result = await ViewCount.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { upsert: true, new: true } 
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to update visit count" });
  }
});

app.get("/api/visit", async (req, res) => {
  try {
    const data = await ViewCount.findOne();
    res.status(200).json(data || { count: 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visit count" });
  }
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);
app.use("/api", routes);

module.exports = app;
