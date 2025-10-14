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
});

app.post("/api/visit", viewLimiter, async (req, res) => {
  await ViewCount.updateOne({}, { $inc: { count: 1 } }, { upsert: true });
  const data = await ViewCount.findOne();
  res.status(200).json(data);
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
