const carordersModel = require("../../models/carorder");

module.exports.carorders = async (req, res) => {
  try {
    const user = req.user;
    const orders = await carordersModel
      .find({ user: user._id })
      .populate({ path: "user", select: "-password -token" });

    return res.json({
      success: true,
      message: "orders",
      data: orders,
    });
  } catch (error) {
    return res.send(error.message);
  }
};
