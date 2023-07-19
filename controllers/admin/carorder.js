const carordersModel = require("../../models/carorder");

module.exports.getAllCarOrders = async (req, res) => {
  try {
    const orders = await carordersModel
      .find()
      .populate({ path: "user", select: "-password -token" });

    const ordersCount = await carordersModel.find().count();

    return res.json({
      success: true,
      message: "all orders",
      status: 200,
      data: orders,
      ordersCount,
    });
  } catch (error) {
    return res.send(error.message);
  }
};
