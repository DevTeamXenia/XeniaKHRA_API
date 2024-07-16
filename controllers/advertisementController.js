
const advertisementService = require('../services/advertisementService');


exports.createadvertisement = async (req, res, next) => {
    try {
        information  = await advertisementService.createadvertisement(req.body); 
      res.status(201).json(information);
    } catch (error) {
      next(error);
    }
  };


  exports.updateAdvertisement = async (req, res, next) => {
    const { advertisementId } = req.params;
    try {
      const updated = await advertisementService.updateAdvertisement(advertisementId, req.body);
      if (updated) {
          res.status(200).json(updated);
      } else {
        res.status(404).json({ error: ' Advertisement not found' });
      }
    } catch (error) {
      next(error);
    }
  };


  exports.getInformation = async (req, res, next) => {
    try {
        const partialName = req.params.partialName;
        const advertisement = await advertisementService.getIndormationByPartialName(partialName);
        res.json(advertisement);
    } catch (error) {
        next(error);
    }
};


exports.getStateadvertisement = async (req, res, next) => {
  const { page = 1, limit = 10, searchText, districtid, fromdate, todate, advertisementId } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
      const result = await advertisementService.getStateadvertisement({
          page: pageNumber,
          limit: limitNumber,
          searchText,
          districtid,
          fromdate,
          todate,
          advertisementId
      });

      const { records, total, amount } = result;
      const totalPages = Math.ceil(total / limitNumber);

      let responseData;
      if (advertisementId && records.length === 1) {
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




  exports.ApproveAdvertisement = async (req, res, next) => {
    const { advertisementId } = req.params;
    const { activeStatus } = req.body;
  
    if (typeof activeStatus !== 'boolean') {
      return res.status(400).json({ error: 'Invalid activeStatus value. It must be a boolean.' });
    }
  
    try {
      const updated = await advertisementService.ApproveAdvertisement(advertisementId, activeStatus);
      if (updated) {
        res.status(200).json(updated);
      } else {
        res.status(404).json({ error: 'Advertisement not found or no changes were made' });
      }
    } catch (error) {
      next(error);
    }
  };


  exports.getadvertisementList = async (req, res, next) => {
    try {
        const advertisements = await advertisementService.getadvertisementList();

        const response = {
            status: "success",
            data: advertisements
        };

        res.json(response);
    } catch (error) {
        next(error);
    }
};