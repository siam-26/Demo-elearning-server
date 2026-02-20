const CompanyVerification = require("../models/verifyCompany.model");


exports.createCompanyVerification = async (payload) => {
  const data = await CompanyVerification.create(payload);
  return data;
};

exports.getAllCompanyVerifications = async () => {
  const data = await CompanyVerification.find();
  return data;
};

exports.getAllVerifiedCompany = async () => {
  const data = await CompanyVerification.find({ status: 'Verified' });
  return data;
};

exports.getSingleCompanyVerification = async (id) => {
  const data = await CompanyVerification.findById(id);
  return data;
};

exports.updateCompanyVerification = async (id, payload) => {
  const data = await CompanyVerification.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return data;
};

exports.deleteCompanyVerification = async (id) => {
  const data = await CompanyVerification.findByIdAndDelete(id);
  return data;
};


