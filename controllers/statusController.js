const statusService = require('../services/statusService');


exports.getaccstatus = async (req, res, next) => {
    try {
      const userid = req.params.userid;
      const status = await statusService.getAccStatusAndPaymentHistory(userid);
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


exports.memberDeactivation = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const updated = await statusService.memberDeactivation(userId, req.body);
    if (updated) {
        res.status(200).json(updated);
    } else {
      res.status(404).json({ error: 'Memeber not found' });
    }
  } catch (error) {
    next(error);
  }
};
