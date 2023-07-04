const express = require("express");
const app = express();
const port = process.env.PORT;
var bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
var path = require("path");
var cors = require("cors");
const cloudinary = require("./uploadimgcloudinary");

// To access public folder
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Set up Global configuration access
dotenv.config();

// MULTER
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

const {
  register,
  login,
  updateUser,
  deleteUser,
  userById,
  resetPassword,
} = require("./controllers/auth/auth");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  uploadImgCloud,
} = require("./controllers/products/products");
const {
  checkout,
  addToCart,
  cart,
  removeFromCart,
} = require("./controllers/user/cart");
const { isAdmin, checkAuth } = require("./controllers/middlewares/auth");
const { dashboardData, getAllUsers } = require("./controllers/admin/dashboard");
const {
  getAllOrders,
  changeStatusOfOrder,
} = require("./controllers/admin/orders");
const { orders } = require("./controllers/user/orders");
const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("./controllers/categories/category");
const {
  addToWishlist,
  wishlist,
  removeFromWishlist,
} = require("./controllers/user/wishlist");
const mongoose = require("./config/database")();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// AUTH
app.post("/register", register);
app.post("/login", login);

// User Routes
app.post("/update-user", updateUser);
app.get("/user", userById);
app.get("/delete-user", deleteUser);
app.post("/reset-password", resetPassword);

// Products
app.post("/product", [isAdmin], addProduct);
app.get("/products", getAllProducts);
app.post("/update-product", [isAdmin], updateProduct);
app.get("/delete-product", [isAdmin], deleteProduct);

// CATEGORIES
app.post("/category", [isAdmin], addCategory);
app.get("/categories", getCategories);
app.post("/update-category", [isAdmin], updateCategory);
app.get("/delete-category", [isAdmin], deleteCategory);

// ORDERS
app.get("/orders", [checkAuth], orders);

// CHECKOUT
app.post("/checkout", [checkAuth], checkout);

// WISHLIST
app.post("/add-to-wishlist", [checkAuth], addToWishlist);
app.get("/wishlist", [checkAuth], wishlist);
app.get("/remove-from-wishlist", [checkAuth], removeFromWishlist);

// ADMIN
app.get("/dashboard", [isAdmin], dashboardData);
app.get("/admin/orders", [isAdmin], getAllOrders);
app.get("/admin/order-status", [isAdmin], changeStatusOfOrder);
app.get("/admin/users", [isAdmin], getAllUsers);

// HELPER
app.post(
  "/photos/upload",
  upload.single("photo"),
  async function (req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          err: "Please upload an image",
          msg: "Please upload an image",
        });
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      if (
        result &&
        (result.format === "png" ||
          result.format === "jpg" ||
          result.format === "jpeg")
      ) {
        return res.json({ image: result.url });
      }
      return res.status(400).json({
        err: "Invalid file format",
        msg: "Invalid file format",
      });
    } catch (error) {
      return res.send(error.message);
    }
  }
);

// app.post(
//   "/photos/upload",
//   upload.single("photo"),
//   async function (req, res, next) {
//     try {
//       const result = await cloudinary.uploader.upload(req.file.path);
//       req.body.image = result.url;
//       return res.json({ image: file.filename });
//     } catch (error) {
//       return res.send(error.message);
//     }
//   }
// );
app.listen(process.env.PORT || 8081, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});
