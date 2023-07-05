const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// const { TOKEN_KEY } = process.env

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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

// userSchema.methods.generateAuthToken = function () {
//     this.token = jwt.sign({ userID: this._id, email: this.email }, TOKEN_KEY, { expiresIn: '10h' })
// }

module.exports = mongoose.model("user", userSchema);
