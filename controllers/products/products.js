const productModel = require("../../models/product");
const cloudinary = require("../../uploadimgcloudinary");
const { uploadSingleImage } = require("../../uploadImage");
(module.exports.uploadProductImage = uploadSingleImage("image")),
  (module.exports.uploadImgCloud = async (req, res, next) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
       req.body.image = result.url;
      req.body.id = result.public_id;
      next();
    } catch (error) {
      return res.send(error.message);
    }
  });

module.exports.addProduct = async (req, res) => {
  try {
    const { title, sku, price, image, imageId } = req.body;

    if (!title || !sku || !price) return res.send("Fields are empty");

    let product = new productModel(req.body);
    product.save();

    return res.json({
      success: true,
      message: "Product inserted successfully",
      data: product,
      image,
      imageId,
    });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.getProducts = async (req, res) => {
  try {
    const products = await productModel.find();
    const productsCount = await productModel.find().count();

    return res.json({
      success: true,
      status: 400,
      message: "list of all products",
      products,
      count: productsCount,
    });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const { title, sku, price, image } = req.body;
    const { id } = req.query;

    // check if product exist with the given product id
    const product = await productModel.findOne({ _id: id });

    if (product) {
      const updatedProduct = await productModel.findOneAndUpdate(
        { _id: id },
        req.body,
        { new: true }
      );

      return res.json({
        success: true,
        status: 200,
        message: "product updated successfully",
        data: updatedProduct,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "product does not exist",
      });
    }
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.query;

    // check if product exist with the given product id
    const product = await productModel.findById(id);
    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    const productImgId = product.imageId;
    console.log(`Deleting image ${productImgId} from Cloudinary.`);
    // delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(productImgId);
    if (result.result !== "ok") {
      throw new Error(result.result);
    }
    await productModel.findByIdAndRemove(id);
    return res.json({
      success: true,
      message: "product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product.",
      error: error.message,
    });
  }
};


module.exports.getAllProducts = async (req, res) => {
  try {
    // Search through title names
    var { search } = req.query;
    if (!search) search = "";

    const products = await productModel
      .find({ title: { $regex: search, $options: "i" } })
      .populate("category");

    return res.json({
      success: true,
      status: 200,
      message: "list of products",
      data: products,
    });
  } catch (error) {
    return res.json({
      success: false,
      status: 400,
      message: error.message,
    });
  }
};
