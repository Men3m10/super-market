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
      let uploadFile = file.originalname.split(".");
      let name = `${uploadFile[0]}-${Date.now()}.${
        uploadFile[uploadFile.length - 1]
      }`;
      cb(null, name);
    },
  });

  const upload = multer({ storage: multerStorage });
  return upload;
};

module.exports = {
  /*لو انت محتاج تعمل (image proccessing)للصور  اللي هو تعدل طول عرض جوده  ==>هنستخدم ميموري ستوريج */
  //memory storage
  uploadSingleImage: (fieldName) => MulterProps().single(fieldName),

  uploadMixOfImages: (arrOfFields) => MulterProps().fields(arrOfFields),
};
