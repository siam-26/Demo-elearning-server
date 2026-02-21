
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");



const Admins = require('../models/admin.model.js');
const Users = require('../models/user.model.js');
const Contact = require('../models/contact.model.js');


dotenv.config();

exports.createAdminIntoDB = async (payload) => {
  const result = await Admins.create(payload);
  return result;
};

exports.updateAdminIntoDB = async (id, info) => {
  const result = await Admins.findByIdAndUpdate(
    id,
    { $set: info },
    { new: true }
  );
  return result;
};

exports.getAdminIntoDB = async () => {
  const result = await Admins.find();
  return result;
};

// exports.adminLoginServices = async (payload) => {

//   const user = await Admins.findOne({ email: payload.email });

//   if (!user) {
//     return { status: false, message: "No admin found with this email." };
//   }

//   const isPasswordValid = await user.comparePassword(payload.password);

//   if (!isPasswordValid) {
//     return { status: false, message: "Incorrect password." };
//   }

//   // ✅ Generate 6 digit OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   user.otp = otp;
//   user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
//   await user.save();

//   // ✅ Send Email
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true, // true for 465, false for other ports
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_APP_PASSWORD,
//     },
//   });

//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USERNAME,
//       to: user.email,
//       subject: "Admin Login OTP",
//       text: `Your OTP is ${otp}. It expires in 5 minutes.`,
//     });
//     console.log("Email sent successfully!"); // Terminal e check korben
//     return { status: true, message: "OTP sent to your email." };
//   } catch (error) {
//     console.error("Nodemailer Error:", error); // Ekhanei ashol somossya dhora porbe
//     return { status: false, message: "Email pathate somossya hoyeche." };
//   }
// };

// exports.adminLoginServices = async (payload) => {
//   const user = await Admins.findOne({ email: payload.email });
// console.log("Admin found in DB:", user); // Ekhanei check korben je admin asche kina
//   if (!user) {
//     return { status: false, message: "No admin found with this email." };
//   }

//   const isPasswordValid = await user.comparePassword(payload.password);
//   if (!isPasswordValid) {
//     return { status: false, message: "Incorrect password." };
//   }

//   // ✅ OTP Generate
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   console.log("Generated OTP:", otp); // Ekhanei check korben je OTP generate hochche kina
//   user.otp = otp;
//   user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
//   await user.save();

//   // ✅ Transporter Setup
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_APP_PASSWORD, // Space thakle auto remove korbe
//     },
//   });

//   try {
//     console.log("Sending email to:", user.email);
//     await transporter.sendMail({
//       from: process.env.EMAIL_USERNAME,
//       to: user.email,
//       subject: "Admin Login OTP",
//       text: `Your OTP is ${otp}. It expires in 5 minutes.`,
//     });

//     console.log("✅ Mail Sent Successfully"); // Terminal-e eta check korun
//     return {
//       status: true,
//       message: "OTP sent to your email.", // Frontend e eta ashar kotha
//     };
//   } catch (error) {
//     console.error("❌ Nodemailer Error:", error);
//     return { status: false, message: "Failed to send email." };
//   }
// };

// exports.adminLoginServices = async (payload) => {
//   const user = await Admins.findOne({ email: payload.email });
//   if (!user) return { status: false, message: "No admin found" };

//   const isPasswordValid = await user.comparePassword(payload.password);
//   if (!isPasswordValid) return { status: false, message: "Incorrect password" };

//   // OTP Generate
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   user.otp = otp;
//   user.otpExpires = Date.now() + 5 * 60 * 1000;
//   await user.save();

//   // Nodemailer Transporter
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_APP_PASSWORD,
//     },
//     logger: true,
//     debug: true,
//   });

//   try {
//     console.log("EMAIL_USERNAME:", process.env.EMAIL_USERNAME);
//     console.log("EMAIL_APP_PASSWORD:", process.env.EMAIL_APP_PASSWORD);
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_USERNAME,
//       to: user.email,
//       subject: "Admin Login OTP",
//       text: `Your OTP is ${otp}. It expires in 5 minutes.`,
//     });

//     console.log("Email sent:", info.response);
//     return { status: true, message: "OTP sent to your email" };
//   } catch (error) {
//     console.error("Email send failed:", error);
//     return { status: false, message: "Failed to send OTP email" };
//   }
// };

exports.adminLoginServices = async (payload) => {
  let user;
  if (payload.email) {
    user = await Admins.findOne({ email: payload.email });
  } else if (payload.number) {
    user = await Admins.findOne({ number: payload.number });
  }

  if (!user) {
    return {
      status: false,
      message: "No user found with this email or number.",
    };
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    return { status: false, message: "Incorrect password." };
  }

  const jwtPayload = {
    id: user._id,
    role: user.type,
    email: user.email,
  };

  const eccessToken = jwt.sign(jwtPayload, process.env.SECRET_TOKEN, {
    expiresIn: "10d",
  });

  const userInfo = { ...user.toObject(), password: undefined };
  return { status: true, message: "Login successful", data: userInfo };
};

exports.deleteSingleAdminByIdIntoDB = async (id) => {
  const result = await Admins.findByIdAndDelete(id);
  return result;
};

// exports.adminLoginServices = async (payload) => {
//   let user;
//   if (payload.email) {
//     user = await Admins.findOne({ email: payload.email });
//   } else if (payload.number) {
//     user = await Admins.findOne({ number: payload.number });
//   }

//   if (!user) {
//     return {
//       status: false,
//       message: 'No user found with this email or number.',
//     };
//   }

//   const isPasswordValid = await bcrypt.compare(payload.password, user.password);
//   if (!isPasswordValid) {
//     return { status: false, message: 'Incorrect password.' };
//   }

//   const jwtPayload = {
//     id: user._id,
//     role: user.type,
//     email: user.email,
//   };

//   const eccessToken = jwt.sign(jwtPayload, process.env.SECRET_TOKEN, {
//     expiresIn: '10d',
//   });

//   const userInfo = { ...user.toObject(), password: undefined };
//   return { status: true, message: 'Login successful', data: userInfo };
// };

exports.dashboardOverview = async () => {
  const user = await Users.countDocuments();
  const admin = await Admins.countDocuments();

  const contact = await Contact.countDocuments();
  const result = {
    user,
    admin,
   
    contact,
  };
  return result;
};


