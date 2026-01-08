import Settings from '../models/Settings.js';

// @desc    Get Ship From Address
// @route   GET /api/settings
export const getSettings = async (req, res) => {
  try {
    // Find the first settings doc or create one if empty
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Ship From Address
// @route   PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    const { shipFrom } = req.body;
    
    // Upsert logic: Update the first found doc, or create it
    const settings = await Settings.findOneAndUpdate(
      {}, // filter (empty matches first doc)
      { shipFrom }, // update
      { new: true, upsert: true } // options
    );
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};