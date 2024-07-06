const unitsService = require('../services/unitService');

// Create a new unit
exports.createUnit = async (req, res, next) => {
  try {
    const unit = await unitsService.createUnit(req.body); // Pass userId to the service function
    res.status(201).json(unit);
  } catch (error) {
    next(error);
  }
};

// Get all units
// exports.getAllUnits = async (req, res, next) => {
//   try {
//     const units = await unitsService.getAllUnits(); 
//     res.json(units);
//   } catch (error) {
//     next(error);
//   }
// };

exports.getAllUnits = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await unitsService.getAllUnits(search, page, limit);

    res.json(result);
  } catch (error) {
    next(error);
  }
};


exports.getdistrictUnits = async (req, res, next) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  try {
    const { units, totalRecords } = await unitsService.getdistrictUnits(userId, page, limit, search);

    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      totalPages,
      currentPage: page,
      limit,
      totalRecords,
      units
    });
  } catch (error) {
    next(error);
  }
};




exports.getAllstateUnits = async (req, res, next) => {
  try {
    const districtId = req.params.districtid; 
    let units;
    if (districtId) {
        units = await unitsService.getAllstateUnits(districtId);
    } else {
        units = await unitsService.getAllUnits(); 
    }
    
    res.json(units);
  } catch (error) {
    next(error);
  }
};







// Update a unit
exports.updateUnit = async (req, res, next) => {
  const { unitId } = req.params;
  try {
    const updated = await unitsService.updateUnit(unitId, req.body);
    if (updated) {
        res.status(200).json(updated);
    } else {
      res.status(404).json({ error: 'Unit not found' });
    }
  } catch (error) {
    next(error);
  }
};

// Delete a unit
exports.deleteUnit = async (req, res, next) => {
  const { unitId } = req.params;
  try {
    const deleted = await unitsService.deleteUnit(unitId);
    if (deleted) {
        res.status(200).json(deleted);
    } else {
      res.status(404).json({ error: 'Unit not found' });
    }
  } catch (error) {
    next(error);
  }
};

//------Unit level member details API
exports.getunitmember = async (req, res, next) => {
  try {
    const member = await unitsService.getunitmember();
    res.json(member);
  } catch (error) {
    next(error);
  }
};