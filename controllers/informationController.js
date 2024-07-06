
const informationService = require('../services/informationService');



exports.createInformation = async (req, res, next) => {
    try {
        information  = await informationService.createInformation(req.body); 
      res.status(201).json(information);
    } catch (error) {
      next(error);
    }
  };


  exports.updateInformation = async (req, res, next) => {
    const { informationId } = req.params;
    try {
      const updated = await informationService.updateInformation(informationId, req.body);
      if (updated) {
          res.status(200).json(updated);
      } else {
        res.status(404).json({ error: 'Information not found' });
      }
    } catch (error) {
      next(error);
    }
  };


  exports.getInformation = async (req, res, next) => {
    try {
        const partialName = req.params.partialName;
        const information = await informationService.getIndormationByPartialName(partialName);
        res.json(information);
    } catch (error) {
        next(error);
    }
};



exports.getStateInformation = async (req, res, next) => {
  const { page = 1, limit = 10, searchText, districtid, fromdate, todate, informationId } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
      const result = await informationService.getStateInformation({
          page: pageNumber,
          limit: limitNumber,
          searchText,
          districtid,
          fromdate,
          todate,
          informationId
      });

      const { records, total } = result;
      const totalPages = Math.ceil(total / limitNumber);


      let responseData;
      if (informationId && records.length === 1) {
          responseData = records[0];
      } else {
          responseData = records;
      }

      res.json({
          status: 'success',
          data: responseData,
          totalPages,
          currentPage: pageNumber,
          limit: limitNumber,
          totalRecords: total
      });
  } catch (error) {
      next(error);
  }
};




exports.ApproveInformation = async (req, res, next) => {
  const { informationId } = req.params;
  const { activeStatus } = req.body;

  if (typeof activeStatus !== 'boolean') {
    return res.status(400).json({ error: 'Invalid activeStatus value. It must be a boolean.' });
  }

  try {
    const updated = await informationService.ApproveInformation(informationId, activeStatus);
    if (updated) {
      res.status(200).json(updated);
    } else {
      res.status(404).json({ error: 'Information not found or no changes were made' });
    }
  } catch (error) {
    next(error);
  }
};