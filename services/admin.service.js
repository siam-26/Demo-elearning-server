
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');



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

exports.getSingleAdminByIdIntoDB = async (id) => {
  const result = await Admins.findById(id);
  return result;
};

exports.deleteSingleAdminByIdIntoDB = async (id) => {
  const result = await Admins.findByIdAndDelete(id);
  return result;
};

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
      message: 'No user found with this email or number.',
    };
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    return { status: false, message: 'Incorrect password.' };
  }

  const jwtPayload = {
    id: user._id,
    role: user.type,
    email: user.email,
  };

  const eccessToken = jwt.sign(jwtPayload, process.env.SECRET_TOKEN, {
    expiresIn: '10d',
  });

  const userInfo = { ...user.toObject(), password: undefined };
  return { status: true, message: 'Login successful', data: userInfo };
};

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


