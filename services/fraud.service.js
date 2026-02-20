const ScamReport = require("../models/fraud.model");
const Users = require("../models/user.model");


exports.createScamReportIntoDB = async (payload) => {
  if (!payload.number) {
    throw new Error('Without number, fraud will not be created');
  }

  const newData = {
    userId: payload.userId || null,
    ...payload,
  };

  const result = await ScamReport.create(newData);
  return result;
};


exports.updateFraudIntoDB = async (id, info) => {
  const result = await ScamReport.findByIdAndUpdate(
    id,
    { $set: info },
    { new: true },
  );
  return result;
};

exports.getFraudIntoDB = async (scamType, search, category) => {
  const filter = {};

  if (scamType) {
    filter.scamType = { $regex: scamType, $options: 'i' };
  }

  if (category) {
    filter.fraudType = { $regex: category, $options: 'i' };
  }

  if (search) {
    filter.$or = [
      { fraudType: { $regex: search, $options: 'i' } },
      { scammerName: { $regex: search, $options: 'i' } },
      { relationType: { $regex: search, $options: 'i' } },
      { scamPlace: { $regex: search, $options: 'i' } },
      { scammerProfile: { $regex: search, $options: 'i' } },
      { number: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { engagedWith: { $regex: search, $options: 'i' } },
      { witness: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const result = await ScamReport.find(filter)
      .populate('userId')
      .sort({ _id: -1 })
      .limit(140);

    return result;
  } catch (error) {
    console.error("Error fetching scam reports:", error);
    return [];
  }
};


exports.getAcceptedFraudIntoDB = async (category) => {
  const query = { reportStatus: 'Accepted' };

  if (category) {
    query.fraudType = category;
  }

  const result = await ScamReport.find(query).populate('userId');
  return result;
};

exports.getSingleFraudByIdIntoDB = async (id) => {
  const result = await ScamReport.findById(id).populate('userId');
  return result;
};

exports.getFraudByNumberDB = async (number) => {
  const result = await ScamReport.find({ number: number }).populate('userId');
  return result;
};

exports.getFraudByTypeIntoDB = async (fraudType) => {
  const result = await ScamReport.find({ fraudType: fraudType }).populate('userId');
  return result;
};

exports.deleteSingleFraudByIdIntoDB = async (id) => {
  const result = await ScamReport.findByIdAndDelete(id);
  return result;
};



