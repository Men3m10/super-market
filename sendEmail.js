//nodemailer
const nodemailer = require("nodemailer");

const sendEmail = async (emailOptions) => {
  //1)create transporter (service that eill send email like "gmail")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure is true -> port = 465 , if secure is false -> port =587
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  //2)define email options (from whom ,to whome , email content )

  const mailOptions = {
    from: "HellsKitchen App <HellsKitchenApp@gmail.com>",
    to: emailOptions.email,
    subject: emailOptions.subject,
    text: emailOptions.message,
  };

  //3)send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
