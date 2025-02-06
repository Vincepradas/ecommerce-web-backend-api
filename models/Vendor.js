const mongoose = require("mongoose");

const vendorAccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["vendor"], default: "vendor" },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  companyName: { type: String, required: true },
});

const Vendor =
  mongoose.models.Vendor || mongoose.model("Vendor", vendorAccountSchema);
module.exports = Vendor;
