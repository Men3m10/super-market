const mongoose = require("mongoose");

const carorderSchema = mongoose.Schema(
  {
    orderId: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    Address: String,
    country: { type: String },
    city: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("carorder", carorderSchema);
