const statusService = require('../services/statusService');


exports.getaccstatus = async (req, res, next) => {
    try {
      const userid = req.params.userid;
      const status = await statusService.getaccstatus(userid);
      res.json(status);
    } catch (error) {
      next(error);
    }
  };


  exports.getTermsAndConditions = async (req, res, next) => {
    try {
        const statusId = req.params.statusId;
        const html = await statusService.getTermsAndConditions(statusId);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        next(error);
    }
};



exports.getPrivacyPolicy = async (req, res, next) => {
  try {
    const statusId = req.params.statusId;
    const html = await statusService.getPrivacyPolicy(statusId);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    next(error);
  }
};



exports.getfamilymember = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const familyMember = await statusService.getfamilymember(userId);

    if (familyMember) {
      res.json(familyMember);
    } else {
      res.status(404).json({ message: 'No family member found' }); 
    }
  } catch (error) {
    next(error);
  }
};

