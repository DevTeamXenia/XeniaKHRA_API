
const contributionService = require('../services/contributionService');


exports.createContribution = async (req, res, next) => {
  try {
      const result = await contributionService.createContribution(req.body);
      if (result.status === 'failed') {
          res.status(400).json(result); 
      } else {
          res.status(201).json(result); 
      }
  } catch (error) {
      next(error);  
  }
};



exports.getMember = async (req, res, next) => {
    try {
        const partialName = req.params.partialName;
        const members = await contributionService.getMembersByPartialName(partialName);
        res.json(members);
    } catch (error) {
        next(error);
    }
};


exports.updateContribution = async (req, res, next) => {
  const { ContributionId } = req.params;
  try {
    const updated = await contributionService.updateContribution(ContributionId, req.body);
    if (updated) {
        res.status(200).json(updated);
    } else {
      res.status(404).json({ error: 'Memeber not found' });
    }
  } catch (error) {
    next(error);
  }
};
  

exports.getDistrictContribution = async (req, res, next) => {
  const { districtid, ContributionId } = req.params;
  const { status } = req.params;
  const { page = 1, limit = 10, searchText } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    let result;
    if (ContributionId) {
      const member = await contributionService.getContribution(ContributionId);
      return res.json(member);
    } else {
      if (status == 0) {
        result = await contributionService.getDistrictPendingContribution({
          page: pageNumber,
          limit: limitNumber,
          searchText,
          districtid, 
        });
      } else if (status == 1) {
        result = await contributionService.getDisrtictApproveContribution({
          page: pageNumber,
          limit: limitNumber,
          searchText,
          districtid, 
        });
      } else {
        return res.status(400).json({ status: 'error', message: 'Invalid status value' });
      }
    }

    const { records, total } = result;
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      status: 'success',
      data: records,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      totalRecords: total
    });
  } catch (error) {
    next(error);
  }
};


// exports.getUnitContribution = async (req, res, next) => {
//   const { unitid } = req.params;
//   const { ContributionId } = req.params;
//   const { page = 1, limit = 2, searchText } = req.query;
//   const pageNumber = parseInt(page, 10);
//   const limitNumber = parseInt(limit, 10);

//   try {
//     if (ContributionId) {
//       const member = await contributionService.getContribution(ContributionId);
//       res.json(member);
//     } else {
//       const { records, total } = await contributionService.getUnitContribution({ 
//         page: pageNumber, 
//         limit: limitNumber, 
//         unitid, 
//         searchText 
//       });
//       const totalPages = Math.ceil(total / limitNumber);

//       res.json({
//         records,
//         totalPages,
//         currentPage: pageNumber,
//         limit: limitNumber,
//         totalRecords: total
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

exports.getUnitContribution = async (req, res, next) => {
  const { unitid, ContributionId } = req.params;
  const { status } = req.params;
  const { page = 1, limit = 10, searchText } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    let result;
    if (ContributionId) {
      const member = await contributionService.getContribution(ContributionId);
      return res.json(member);
    } else {
      if (status == 0) {
        result = await contributionService.getUnitPendingContribution({
          page: pageNumber,
          limit: limitNumber,
          searchText,
          unitid, 
        });
      } else if (status == 1) {
        result = await contributionService.getUnitApproveContribution({
          page: pageNumber,
          limit: limitNumber,
          searchText,
          unitid, 
        });
      } else {
        return res.status(400).json({ status: 'error', message: 'Invalid status value' });
      }
    }

    const { records, total } = result;
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      status: 'success',
      data: records,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      totalRecords: total
    });
  } catch (error) {
    next(error);
  }
};

exports.getStateContribution = async (req, res, next) => {
  const { ContributionId } = req.params;
  const { status } = req.params;
  const { page = 1, limit = 10, searchText } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    let result;
    if (ContributionId) {
      const member = await contributionService.getContribution(ContributionId);
      return res.json(member);
    } else {
      if (status == 0) {
        result = await contributionService.getStatePendingContribution({
          page: pageNumber,
          limit: limitNumber,
          searchText
        });
      } else if (status == 1) {
        result = await contributionService.getStateApproveContribution({
          page: pageNumber,
          limit: limitNumber,
          searchText
        });
      } else {
        return res.status(400).json({ status: 'error', message: 'Invalid status value' });
      }
    }

    const { records, total } = result;
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      status: 'success',
      data: records,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      totalRecords: total
    });
  } catch (error) {
    next(error);
  }
};



//-----Contribution Pending Details------//
exports.conPendingDetails = async (req, res, next) => {
  try {
      const pendingDetails = await contributionService.conPendingDetails();
      res.json({ status: 'success', data: pendingDetails });
  } catch (error) {
      next(error);
  }
};


//-----Contribution Payed Details------//
exports.conPayedDetails = async (req, res, next) => {
  try {
      const payedDetails = await contributionService.conPayedDetails();
      res.json({ status: 'success', data: payedDetails });
  } catch (error) {
      next(error);
  }
};



exports.ApproveContribution = async (req, res, next) => {
  const { contributionId } = req.params;
  const { activeStatus } = req.body;

  if (typeof activeStatus !== 'boolean') {
    return res.status(400).json({ error: 'Invalid activeStatus value. It must be a boolean.' });
  }

  try {
    const updated = await contributionService.ApproveContribution(contributionId, activeStatus);
    if (updated) {
      res.status(200).json(updated);
    } else {
      res.status(404).json({ error: 'Contribution not found or no changes were made' });
    }
  } catch (error) {
    next(error);
  }
};


exports.getContributionDetails = async (req, res, next) => {
  try {
      const ContributionId = req.params.ContributionId;
      const details = await contributionService.getContributionDetails(ContributionId);
      res.json(details);
  } catch (error) {
      next(error);
  }
};


exports.contibutionAmountNotification = async (req, res, next) => {
  try {
      const memberid = req.params.memberid;
      const notification = await contributionService.contibutionAmountNotification(memberid);
      res.json(notification);
  } catch (error) {
      next(error);
  }
};