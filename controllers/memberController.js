const memberService = require('../services/memberService');


exports.getmember = async (req, res, next) => {
  try {
    const membershipNumber = req.params.membershipNumber;

    // Assuming the format KH07040635 and reconstructing to KH/07/04/0635
    const prefix = `KH/${membershipNumber.substring(2, 4)}/${membershipNumber.substring(4, 6)}/`;
    const number = membershipNumber.substring(6);

    const member = await memberService.getmember(prefix, number);
    res.json(member);
  } catch (error) {
    next(error);
  }
};



exports.getAllUnitWiseMember = async (req, res, next) => {
  const { status, unitid } = req.params;
  const { page = 1, limit = 10, searchText } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const active = status == 1;

  try {
    const { records, total } = await memberService.getAllUnitWiseMember({ 
      active, 
      unitid,
      page: pageNumber,
      limit: limitNumber,
      searchText
    });

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


exports.getAllDistrictWiseMember = async (req, res, next) => {
  const { status, districtid } = req.params;
  const { page = 1, limit = 10, searchText } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const active = status == 1;

  try {
    const { records, total } = await memberService.getAllDistrictWiseMember({ 
      active, 
      districtid, 
      page: pageNumber, 
      limit: limitNumber, 
      searchText 
    });
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



exports.getAllStateWiseMember = async (req, res, next) => {
  const { status, pending } = req.params;
  const { page = 1, limit = 10, searchText , districtid, unitid} = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const active = status == 1;

  try {

    const { records, total } = await memberService.getAllStateWiseMembers({ 
      active, 
      pending, 
      page: pageNumber, 
      limit: limitNumber, 
      searchText,
      districtid, 
      unitid
    });
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





  exports.getmemberdtls = async (req, res, next) => {
    try {
      const memberid = req.params.memberid;
      const member = await memberService.getmemberdtls(memberid);
      res.json(member);
    } catch (error) {
      next(error);
    }
  };


  exports.updatememstatus = async (req, res, next) => {
    const { userId } = req.params;
    const { memberStatus, memberReviseRemarks } = req.body;
    
    // console.log('Request Params:', req.params);
    // console.log('Request Body:', req.body);
    
    try {
        const updated = await memberService.updatememstatus(userId, memberStatus, memberReviseRemarks);
        if (updated.status === 'success') {
            res.status(200).json(updated);
        } else {
            res.status(404).json({ error: 'Member not found or no changes were made' });
        }
    } catch (error) {
        next(error);
    }
};



//---------Child Members Outstanding amount------//
exports.getmemOutstanding = async (req, res, next) => {
  try {
      const userId = req.params.userId;
      const member = await memberService.getmemOutstanding(userId);
      res.json({ status: 'success', data: member });
  } catch (error) {
      next(error);
  }
};





exports.getpendingApproveDetails = async (req, res, next) => {
  try {
      const userId = req.params.userId;
      const members = await memberService.getpendingApproveDetails(userId);
      res.json(members);
  } catch (error) {
      next(error);
  }
};


exports.childMemberApprove = async (req, res, next) => {
  const { userId } = req.params;
  const { memberStatus } = req.body; 
  const { memberAction } = req.body; 
  try {
    const updated = await memberService.childMemberApprove(userId, memberStatus,memberAction);
    if (updated) {
      res.status(200).json(updated);
    } else {
      res.status(404).json({ error: 'Member not found or no changes were made' });
    }
  } catch (error) {
    next(error);
    
  }
};