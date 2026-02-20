const Social = require("../models/socialMange.model");


// Create
exports.createSocialLink = async (req, res) => {
  try {
    const newLink = new Social(req.body);
    await newLink.save();
    res.status(201).json(newLink);
  } catch (error) {
    res.status(500).json({ message: 'Create failed', error });
  }
};

// Get All
exports.getAllSocialLinks = async (req, res) => {
  try {
    const links = await Social.find();
    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error });
  }
};

// Get One
exports.getSocialLinkById = async (req, res) => {
  try {
    const link = await Social.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    res.status(200).json(link);
  } catch (error) {
    res.status(500).json({ message: 'Fetch failed', error });
  }
};

// Update
exports.updateSocialLink = async (req, res) => {
  try {
    const updated = await Social.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Link not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error });
  }
};

// Delete
exports.deleteSocialLink = async (req, res) => {
  try {
    const deleted = await Social.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Link not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error });
  }
};
