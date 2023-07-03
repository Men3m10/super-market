const path = require("path");
const multer = require("multer");

const MulterProps = () => {
  //////////////////////////////////////////////////////
  // disk storage==>لو انت مش عايز تعدل حاجه هنكتفي ب دي
  const multerStorage = multer.diskStorage({
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
  ////////////////////////////////////////////////////////////////////
  // const multerStorage = multer.diskStorage();

  // const multerFilter = function (req, file, cb) {
  //   console.log(file);
  //   if (file.mimetype.startsWith("image") || file.mimetype === "image/gif") {
  //     cb(null, true);
  //   } else {
  //     cb(new ApiError("Onley Images Allowed", 400), false);
  //   }
  // };

  const upload = multer({ storage: multerStorage });
  return upload;
};

module.exports = {
  /*لو انت محتاج تعمل (image proccessing)للصور  اللي هو تعدل طول عرض جوده  ==>هنستخدم ميموري ستوريج */
  //memory storage
  uploadSingleImage: (fieldName) => MulterProps().single(fieldName),

  uploadMixOfImages: (arrOfFields) => MulterProps().fields(arrOfFields),
};
