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
      message: "تم اضافه المنتج بنجاح",
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
      message: "قائمة بجميع المنتجات",
      products,
      count: productsCount,
    });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
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
        message: "تم تحديث المنتج بنجاح",
        data: updatedProduct,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "المنتج غير موجود",
      });
    }
  } catch (error) {
    return res.json({ error: error });
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
        message: "المنتج غير موجود",
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
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف المنتج.",
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
      message: "قائمة المنتجات",
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
