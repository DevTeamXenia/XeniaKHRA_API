const express = require('express');
const router = express.Router();    
const memberController = require('../controllers/dashboardController')
const tokenService = require('../utils/JWTtokenService');

router.get('/stateAA', tokenService.verifyWebUser, memberController.getAllStateWiseDetails);
router.get('/districtAA', tokenService.verifyWebUser, memberController.getAllDistrictWiseDetails);
router.get('/unitAA', tokenService.verifyWebUser, memberController.getAllUnitWiseDetails);
router.get('/graph/stateAA', tokenService.verifyWebUser, memberController.getAllStateWiseGraphDetails);
router.get('/graph/districtAA', tokenService.verifyWebUser, memberController.getAllDistrictWiseGraphDetails);

//----------Real router for dashboard-----//
router.get('/state', tokenService.verifyWebUser, memberController.getAllStateWiseDetailsAndGraph);
router.get('/district', tokenService.verifyWebUser, memberController.getAllDistrictWiseDetailsAndGraph);

module.exports = router;