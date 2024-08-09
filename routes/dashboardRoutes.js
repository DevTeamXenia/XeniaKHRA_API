const express = require('express');
const router = express.Router();    
const dashboardController = require('../controllers/dashboardController')
const tokenService = require('../utils/JWTtokenService');

router.get('/stateAA', tokenService.verifyWebUser, dashboardController.getAllStateWiseDetails);
router.get('/districtAA', tokenService.verifyWebUser, dashboardController.getAllDistrictWiseDetails);
router.get('/unitAA', tokenService.verifyWebUser, dashboardController.getAllUnitWiseDetails);
router.get('/graph/stateAA', tokenService.verifyWebUser, dashboardController.getAllStateWiseGraphDetails);
router.get('/graph/districtAA', tokenService.verifyWebUser, dashboardController.getAllDistrictWiseGraphDetails);

//----------Real router for dashboard-----//
router.get('/state', tokenService.verifyWebUser, dashboardController.getAllStateWiseDetailsAndGraph);
router.get('/district', tokenService.verifyWebUser, dashboardController.getAllDistrictWiseDetailsAndGraph);

module.exports = router;