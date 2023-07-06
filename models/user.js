const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// const { TOKEN_KEY } = process.env

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: [true, "this email used before"],
      lowercase: [true, "email required"],
    },
    userType: String,
    password: String,
    token: String,
    wishlist: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: Number,
      },
    ],
    passwordRestCode: String,
    passwordRestExpires: Date,
    passwordRestVerified: Boolean,
  },
  { timestamps: true }
);



module.exports = mongoose.model("user", userSchema);
