import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER || 'muhammmadazizekubov@gmail.com',
    pass: process.env.EMAIL_PASS || 'qgjm psdq esxn ktan',
  },
});

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'muhammmadazizekubov@gmail.com',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;
