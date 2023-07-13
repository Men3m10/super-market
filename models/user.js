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
      trim: true,
    },
    userType: String,
    password: String,
    phone: String,
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
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

// userSchema.methods.generateAuthToken = function () {
//     this.token = jwt.sign({ userID: this._id, email: this.email }, TOKEN_KEY, { expiresIn: '10h' })
// }

module.exports = mongoose.model("user", userSchema);
