var cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dj3uyodvz",
  api_key: "955235792318767",
  api_secret: "Eertp4kTJO_6SP4Nlb67QRD69EM",
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
