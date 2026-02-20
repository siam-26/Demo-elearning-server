const { createCompanyVerification, getAllCompanyVerifications, getAllVerifiedCompany, getSingleCompanyVerification, updateCompanyVerification, deleteCompanyVerification } = require("../services/verifyCOmpany.service");


exports.createCompanyVerificationController = async (req, res) => {
  try {
    const payload = req.body;
    const data = await createCompanyVerification(payload);
    res.status(200).json({
      status: true,
      message: 'Company verification created successfully',
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: 'Failed to create company verification',
      error: error,
    });
  }
};

exports.getAllCompanyVerificationsController = async (req, res) => {
  try {
    const data = await getAllCompanyVerifications();
    res.status(200).json({
      status: true,
      message: 'Company verifications retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: 'Failed to retrieve company verifications',
      error: error,
    });
  }
};

exports.getAllVerifiedCompanysController = async (req, res) => {
  try {
    const data = await getAllVerifiedCompany();
    res.status(200).json({
      status: true,
      message: 'Company verifications retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: 'Failed to retrieve company verifications',
      error: error,
    });
  }
};

exports.getSingleCompanyVerificationController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getSingleCompanyVerification(id);
    if (!data) {
      return res.status(404).json({
        status: false,
        message: 'Company verification not found',
      });
    }
    res.status(200).json({
      status: true,
      message: 'Company verification retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: 'Failed to retrieve company verification',
      error: error,
    });
  }
};

exports.updateCompanyVerificationController = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const data = await updateCompanyVerification(id, payload);
    if (!data) {
      return res.status(404).json({
        status: false,
        message: 'Company verification not found',
      });
    }
    res.status(200).json({
      status: true,
      message: 'Company verification updated successfully',
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: 'Failed to update company verification',
      error: error,
    });
  }
};

exports.deleteCompanyVerificationController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteCompanyVerification(id);
    if (!data) {
      return res.status(404).json({
        status: false,
        message: 'Company verification not found',
      });
    }
    res.status(200).json({
      status: true,
      message: 'Company verification deleted successfully',
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: 'Failed to delete company verification',
      error: error,
    });
  }
};


