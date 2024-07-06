const nomineeService = require('../services/nomineeService');

exports.getNominee = async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, search = '' , unitid} = req.query;

  try {
    if (userId) {
      const nominee = await nomineeService.getnominee(userId);
      res.json(nominee);
    } else {
      const paginationData = await nomineeService.getAllNominees(page, limit, search, unitid);
      res.json(paginationData);
    }
  } catch (error) {
    next(error);
  }
};


  exports.updatenominee = async (req, res, next) => {
    const { userId } = req.params;
    try {
      const updated = await nomineeService.updatenominee(userId, req.body);
      if (updated) {
          res.status(200).json(updated);
      } else {
        res.status(404).json({ error: 'Nominee not found' });
      }
    } catch (error) {
      next(error);
    }
  };


    exports.approveNominee = async (req, res, next) => {
      const { userId } = req.params;
      const { memberStatus } = req.body; 
      try {
        const updated = await nomineeService.approveNominee(userId, memberStatus);
        if (updated) {
          res.status(200).json(updated);
        } else {
          res.status(404).json({ error: 'Member not found or no changes were made' });
        }
      } catch (error) {
        next(error);
        
      }
    };