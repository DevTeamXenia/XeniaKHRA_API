const reportService = require('../services/reportService');


exports.StateContribution = async (req, res, next) => {
  const { status } = req.params;
  const { page = 1, limit = 10, searchText, districtid, unitid ,fromdate, todate, event} = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    let result;
    if (status == 0) {
      result = await reportService.StatePendingContribution({
        page: pageNumber,
        limit: limitNumber,
        searchText,
        districtid, 
        unitid,
        fromdate,
        todate,
        event
      });
    } else if (status == 1) {
      result = await reportService.StatePayedContribution({
        page: pageNumber,
        limit: limitNumber,
        searchText,
        districtid, 
        unitid,
        fromdate,
        todate,
        event
      });
    } else {
      return res.status(400).json({ status: 'error', message: 'Invalid status value' });
    }

    const { records, total, amount } = result;
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      status: 'success',
      data: records,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      totalRecords: total,
      totalAmount: amount
    });
  } catch (error) {
    next(error);
  }
};


exports.DistrictContribution = async (req, res, next) => {
  const { status } = req.params;
  const { page = 1, limit = 10, searchText , districtid, unitid, fromdate, todate, event} = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    let result;

    if (status == 0) {
      result = await reportService.DistrictPendingContribution({
        page: pageNumber,
        limit: limitNumber,
        searchText,
        districtid,
        unitid,
        fromdate, 
        todate,
        event
      });
    } else if (status == 1) {
      result = await reportService.DistrictPayedContribution({
        page: pageNumber,
        limit: limitNumber,
        searchText,
        districtid,
        unitid,
        fromdate, 
        todate,
        event
      });
    } else {
      return res.status(400).json({ status: 'error', message: 'Invalid status value' });
    }

    const { records, total, amount } = result;
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      status: 'success',
      data: records,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      totalRecords: total,
      totalAmount: amount
    });
  } catch (error) {
    next(error);
  }
};


exports.UnitContribution = async (req, res, next) => {
  const { status } = req.params;
  const { page = 1, limit = 10, searchText , unitid, fromdate, todate, event} = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    let result;

    if (status == 0) {
      result = await reportService.UnitPendingContribution({
        page: pageNumber,
        limit: limitNumber,
        searchText,
        unitid,
        fromdate,
        todate,
        event
      });
    } else if (status == 1) {
      result = await reportService.UnitPayedContribution({
        page: pageNumber,
        limit: limitNumber,
        searchText,
        unitid,
        fromdate,
        todate,
        event
      });
    } else {
      return res.status(400).json({ status: 'error', message: 'Invalid status value' });
    }

    const { records, total, amount } = result;
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      status: 'success',
      data: records,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      totalRecords: total,
      totalAmount: amount
    });
  } catch (error) {
    next(error);
  }
};


exports.payment = async (req, res, next) => {
  const { page = 1, limit = 10, searchText, districtid, unitid, fromdate, todate, paytype } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    let records, total, amount;
    if (paytype === '3') {
      ({ records, total, amount } = await reportService.paymentcontribution({ 
        page: pageNumber, 
        limit: limitNumber, 
        searchText,
        districtid, 
        unitid,
        fromdate,
        todate,
        paytype
      }));
    } else if (paytype === '1' || paytype === '2') { 
      ({ records, total, amount } = await reportService.paymentothers({ 
        page: pageNumber, 
        limit: limitNumber, 
        searchText,
        districtid, 
        unitid,
        fromdate,
        todate,
        paytype
      }));
    } else if (!paytype){
      ({ records, total, amount } = await reportService.paymentAll({ 
        page: pageNumber, 
        limit: limitNumber, 
        searchText,
        districtid, 
        unitid,
        fromdate,
        todate
      }));
    }

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      status: 'success',
      data: records,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      totalRecords: total,
      totalAmount: amount
    });
  } catch (error) {
    next(error);
  }
};


  
  

  exports.getEvent = async (req, res, next) => {
    const { searchText } = req.query;
    try {
        const event = await reportService.getEvent(searchText);
        res.json(event);
    } catch (error) {
        next(error);
    }
};
