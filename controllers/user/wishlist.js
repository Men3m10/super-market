const userModel = require("../../models/user");
const { ObjectId } = require("mongodb");

module.exports.addToWishlist = async (req, res) => {
  try {
    const data = req.body;
    let user = req.user;

    const addToWishlist = await userModel.findOneAndUpdate(
      { _id: user?._id },
      { $push: { wishlist: data } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "تم اضافه المنتج في المفضلات بنجاح",
      data: addToWishlist,
    });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.removeFromWishlist = async (req, res) => {
  try {
    const id = req.query;
    let user = req.user;

    const removeFromWishlist = await userModel.findOneAndUpdate(
      { _id: user?._id },
      { $pull: { wishlist: { productId: ObjectId(id) } } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "تمت إزالة المنتج من المفضلات بنجاح",
      data: removeFromWishlist,
    });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.wishlist = async (req, res) => {
  try {
    const user = req.user;

    const wishlist = await userModel
      .find({ _id: user._id })
      .populate("wishlist.productId")
      .select("-password -userType");

    if (!wishlist) {
      return res.json({
        success: false,
        message: "أضف بعض المنتجات إلى قائمة مفضلاتك",
      });
    }

    return res.json({
      success: true,
      message: "Wishlist",
      data: wishlist,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
