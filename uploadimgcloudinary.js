var cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dskoxsteo",
  api_key: "821363899943575",
  api_secret: "2u2jnMBF3t3G5ciEyIEys8NNZN0",
});

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};

// const uploadImageCloudinary = (image) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(image, opts, (err, res) => {
//       if (res && res.secure_url) {
//         console.log(res.secure_url);
//         return resolve(res.secure_url);
//       }
//       console.log(err.message);
//       return reject({ message: err.message });
//     });
//   });
// };

module.exports = cloudinary;
