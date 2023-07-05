const userModel = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.TOKEN_KEY;
const crypto = require("crypto");
const sendEmail = require("../../sendEmail");
function generateAuthToken(data) {
  const token = jwt.sign(data, JWT_SECRET_KEY, { expiresIn: "10h" });
  return token;
}

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        status: 400,
        message: "user does not exist with this email and password",
      });
    }

    // bcrypting the password and comparing with the one in db
    if (await bcrypt.compare(password, user.password)) {
      const token = generateAuthToken({ _id: user?._id, email: email });
      user.token = token;
      user.save();

      return res.json({
        success: true,
        status: 200,
        message: "user Logged in",
        data: user,
      });
    }
    return res.json({
      success: false,
      status: 400,
      message: "email or password is incorrect",
    });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.register = async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;

    // if any one of the field from email and password is not filled
    if (!email || !password) {
      return res.json({
        success: false,
        message: "email or password is empty",
      });
    }
    req.body.password = await bcrypt.hash(password, 10);

    let user = new userModel(req.body);
    await user.save();

    return res.json({
      success: true,
      message: "user registered successfully",
      data: user,
    });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const userDataToBeUpdated = req.body;
    const { id } = req.query;
    const user = await userModel.findOne({ _id: id });

    if (!user) return res.send("user does not exist");

    let updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      userDataToBeUpdated,
      { new: true }
    );

    return res.json({
      success: true,
      message: "user updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.send("error : ", error.message);
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.query;

    const user = await userModel.findOne({ _id: id });
    if (!user) return res.status(200).send("user does not exist");

    await userModel.findOneAndDelete({ _id: id });

    return res.json({
      success: true,
      message: "user deleted successfully",
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

module.exports.userById = async (req, res) => {
  try {
    const { id } = req.query;

    const user = await userModel.findOne({ _id: id });
    if (!user) return res.send("user does not exist");

    return res.json({
      success: true,
      message: "user deleted successfully",
      data: user,
    });
  } catch (error) {
    return res.send("error : ", error.message);
  }
};



module.exports.forgetPassword = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return next(
        res
          .status(404)
          .send(`there is no user with this email ${req.body.email}`)
      );
    }
    //2-if user exist , generate random 6 digits and save it in db and encrypt it to protect from hacking
    const ResetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedRestCode = crypto
      .createHash("sha256")
      .update(ResetCode)
      .digest("hex");

    //save hashed reset code into db
    user.passwordRestCode = hashedRestCode;
    //add expiration time to rest code (10 min)
    user.passwordRestExpires = Date.now() + 10 * 60 * 1000; //mille second to second
    user.passwordRestVerified = false;

    await user.save();
    //3-send the reset code via email
    const message = `Hi ${user.name} ,\n We received a request to reset the password on your EasyBuy. \n${ResetCode} \n Enter this code to complete the reset \n thanks for helping us keep your account secure \n the EasyBuy team`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your Password Rest Code (Valid For 10 Min) ",
        message,
      });
    } catch (error) {
      user.passwordRestCode = undefined;
      user.passwordRestExpires = undefined;
      user.passwordRestVerified = undefined;
      await user.save();
      return next(
        res.status(500).send("there is an error in sending to email")
      );
    }

    res
      .status(200)
      .json({ status: "success", message: "reset code sent to email" });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.verifyResetCode = async (req, res, next) => {
  try {
    //1) check reset code you enter is = reset code you send
    const hashedRestCode = crypto
      .createHash("sha256")
      .update(req.body.resetCode)
      .digest("hex");
    //2)  get user by reset number
    const user = await userModel.findOne({ passwordRestCode: hashedRestCode });
    if (!user) {
      return next(res.status(404).send("Reset code invalid"));
    }
    //3) check reset code is  expired
    const checkExpired = await userModel.findOne({
      passwordRestExpires: { $gt: Date.now() },
    }); //لازم يكون وقت الانتهاء اكبر من الوقت اللي انا بدخله فيه
    if (!checkExpired) {
      return next(res.status(401).send("Reset code expired"));
    }
    //4)valid rest code
    user.passwordRestVerified = true;
    await user.save();

    res.status(200).json({ message: "verified successfully" });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    //1) check user verified rest code
    //get user by email
    const { email } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
      return next(res.status(404).send("No user with this Email "));
    }
    //2)if verify is true
    if (!user.passwordRestVerified) {
      return next(
        res.status(400).send("We send a Reset Code ,Please verify your email")
      );
    }

    //3) set new password
    user.password = await bcrypt.hash(req.body.newPassword, 10);
    user.passwordRestCode = undefined;
    user.passwordRestExpires = undefined;
    user.passwordRestVerified = undefined;
    await user.save();
    //if every thing is ok generate new token

    const token = generateAuthToken({ _id: user?._id, email: email });
    user.token = token;
    await user.save();

    res.status(200).json({ message: "new password set successfully", token });
  } catch (error) {
    return res.send(error.message);
  }
};
