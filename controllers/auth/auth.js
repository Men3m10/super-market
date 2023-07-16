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
        message: "المستخدم غير موجود ",
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
        message: "تم تسجيل الدخول",
        data: user,
      });
    }
    return res.json({
      success: false,
      status: 400,
      message: "كلمه المرور او البريد غير صحيح",
    });
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports.register = async (req, res) => {
  try {
    const { email, password, name, userType ,phone} = req.body;

    // if any one of the field from email and password is not filled
    if (!email || !password) {
      return res.json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور فارغة",
      });
    }

    const Dubel = await userModel.findOne({ $or: [{ email }, { phone }] });
    if (Dubel) {
      return res.json({
        success: false,
        message: "تم استخدام هذا البريد الإلكتروني أو هذا الهاتف من قبل ",
      });
    }
    req.body.password = await bcrypt.hash(password, 10);

    let user = new userModel(req.body);
    await user.save();

    return res.json({
      success: true,
      message: "تم التسجيل بنجاح",
      data: user,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    //1)update logged user passwored based on payload(user._id) from protect route
    const { id } = req.query;
    const { password, newPassword } = req.body;
    const findUser = await userModel.findOne({ _id: id });
    if (!findUser || !(await bcrypt.compare(password, findUser.password))) {
      return res.status(401).json({
        success: false,
        message: " كلمة المرور الحالية غير صحيحة",
      });
    }
    if (!password || !newPassword) {
      return res.status(401).json({
        success: false,
        message: "يجب إدخال كلمة المرور وكلمة المرور الجديدة ",
      });
    }

    findUser.password = await bcrypt.hash(newPassword, 10);
    findUser.passwordChangedAt = Date.now();

    await findUser.save();

    //2) generate token
    const token = generateAuthToken({ _id: findUser?._id });
    findUser.token = token;
    findUser.save();

    res.status(200).json({ success: true, data: findUser, token });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const userDataToBeUpdated = req.body;
    const { id } = req.query;
    const user = await userModel.findOne({ _id: id });

    if (!user) return res.json({success: false,message: "المستخدم غير موجود"});


    let updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      userDataToBeUpdated,
      { new: true }
    );

    return res.json({
      success: true,
      message: "تم تحديث المستخدم بنجاح",
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
    if (!user) return res.status(400).json({success: false,message: "المستخدم غير موجود"});

    await userModel.findOneAndDelete({ _id: id });

    return res.json({
      success: true,
      message: "تم حذف المستخدم بنجاح",
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

module.exports.userById = async (req, res) => {
  try {
    const { id } = req.query;

    const user = await userModel.findOne({ _id: id });
    if (!user) return res.status(400).json({success: false,message: "المستخدم غير موجود"});

    return res.json({
      success: true,
      message: "تم حذف المستخدم بنجاح",
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
        res.status(404).json({
          status: "failed",
          message: "لا يوجد مستخدم بهذا البريد الإلكتروني",
        })
      );
    }
    //2-if user exist , generate random 4 digits and save it in db and encrypt it to protect from hacking
    const ResetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const ResetCode2 = ResetCode[3] + ResetCode[2] + ResetCode[1] + ResetCode[0];
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
    const message = `أهلاً ${user.name} ,\n تلقينا طلبًا لإعادة تعيين كلمة المرور على Hells Kitchen. \n${ResetCode2} \n أدخل هذا الرمز لإكمال إعادة التعيين \n شكرا لمساعدتنا في الحفاظ على آمنة حسابك \n the Hells Kitchen team`;

    try {
      await sendEmail({
        email: user.email,
        subject: "رمز إعادة تعيين كلمة المرور الخاصة بك (صالح لمدة 10 دقائق)",
        message,
      });
    } catch (error) {
      user.passwordRestCode = undefined;
      user.passwordRestExpires = undefined;
      user.passwordRestVerified = undefined;
      await user.save();
      return next(
        res.status(500).json({ status: "failed", message: "هناك خطأ في الإرسال إلى البريد الإلكتروني" })
      );
    }

    res
      .status(200)
      .json({ status: "success", message: "تم ارسال otp" });
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
      return next(
        res.status(404).json({
          status: "failed",
          message: "رمز اعاده التعيين غير صحيح",
        })
      );
    }
    //3) check reset code is  expired
    const checkExpired = await userModel.findOne({
      passwordRestExpires: { $gt: Date.now() },
    }); //لازم يكون وقت الانتهاء اكبر من الوقت اللي انا بدخله فيه
    if (!checkExpired) {
      return next(
        res.status(401).json({
          status: "failed",
          message: "انتهت صلاحية رمز إعادة التعيين",
        })
      );
    }
    //4)valid rest code
    user.passwordRestVerified = true;
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "تم التحقق بنجاح" });
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
      return next(
        res.status(404).json({
          status: "failed",
          message: "لا يوجد مستخدم بهذا البريد الإلكتروني",
        })
      );
    }
    //2)if verify is true
    if (!user.passwordRestVerified) {
      return next(
        res.status(400).json({
          status: "failed",
          message: "نرسل رمز إعادة التعيين ، يرجى التحقق من بريدك الإلكتروني ",
        })
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

    res.status(200).json({
      status: "success",
      message: "تم تعيين كلمة المرور الجديدة بنجاح",
      token,
    });
  } catch (error) {
    return res.send(error.message);
  }
};
