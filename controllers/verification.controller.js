

const ScamReport = require("../models/fraud.model");
const VerificationRequest = require("../models/verification.model");

// ইউজার request করলো
exports.requestVerification = async (req, res) => {
  try {
    console.log(req)
    const { reportId } = req.params;
    const userId = req.body.userId; // assume auth middleware

    const report = await ScamReport.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.reportStatus !== "Pending")
      return res.status(400).json({ message: "Already requested or reviewed" });

    report.reportStatus = "Requested";
    await report.save();

    await VerificationRequest.create({ reportId, userId });

    res.json({ message: "Verification requested successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// ইউজার withdraw করলো
exports.withdrawVerification = async (req, res) => {
  try {
    const { reportId } = req.params;
     const userId = req.body.userId; 

    const report = await ScamReport.findById(reportId);
    if (!report || report.userId.toString() !== userId.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const request = await VerificationRequest.findOne({ reportId, userId });
    // if (!request || request.status !== "Pending")
    //   return res.status(400).json({ message: "No pending request found" });

    report.reportStatus = "Pending";
    await report.save();

    request.status = "Withdrawn";
    await request.save();

    res.json({ message: "Request withdrawn" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// অ্যাডমিন pending গুলো দেখবে
exports.getPendingVerifications = async (req, res) => {
  try {
    const requests = await VerificationRequest.find({ status: "Pending" })
      .populate("reportId")
      .populate("userId");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// অ্যাডমিন review করলো
exports.reviewVerification = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body; // "Approved" or "Rejected"

    if (!["Approved", "Rejected"].includes(action))
      return res.status(400).json({ message: "Invalid action" });

    const report = await ScamReport.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.reportStatus = action;
    await report.save();

    await VerificationRequest.updateMany(
      { reportId },
      { status: "Reviewed" }
    );

    res.json({ message: `Report ${action.toLowerCase()} successfully` });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// অ্যাডমিন note add করলো
exports.addAdminNote = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { note } = req.body;

    const report = await ScamReport.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.adminNotes.push({ note });
    await report.save();

    res.json({ message: "Note added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// User নিজের verification requests দেখবে
exports.getUserVerificationRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    const requests = await VerificationRequest.find({ userId })
      .populate("reportId");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};


// Admin verification request ডিলিট করবে
exports.deleteVerificationRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const deleted = await VerificationRequest.findByIdAndDelete(requestId);

    if (!deleted) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

