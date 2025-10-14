const mongoose = require("mongoose");

const viewCount = new mongoose.Schema(
  {
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("count", viewCount);
