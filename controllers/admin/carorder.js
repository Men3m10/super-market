const ordersModel = require("../../models/order");

module.exports.getAllCarOrders = async (req, res) => {
  try {
    const orders = await ordersModel
      .find()
      .populate({ path: "user", select: "-password -token" });

    const ordersCount = await ordersModel.find().count();

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
