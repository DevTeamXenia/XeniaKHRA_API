const districtService = require('../services/districtService');

// Get all units
exports.getAllDistrict = async (req, res, next) => {
  try {
    const district = await districtService.getAllDistrict();
    res.json(district);
  } catch (error) {
    next(error);
  }
};


// Update a district details
exports.updatedistrict = async (req, res, next) => {
  const { districtid } = req.params;
  try {
    const updated = await districtService.updatedistrict(districtid, req.body);
    if (updated) {
        res.status(200).json(updated);
    } else {
      res.status(404).json({ error: 'District not found' });
    }
  } catch (error) {
    next(error);
  }
};