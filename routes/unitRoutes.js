const express = require('express');
const router = express.Router();    
const unitController = require('../controllers/unitController')
const tokenService = require('../utils/JWTtokenService');

// router.post('/create',tokenService.verifyWebUser, unitController.createUnit);
router.post('/create', tokenService.verifyWebUser, unitController.createUnit);

router.get('/district/:userId',tokenService.verifyWebUser, unitController.getdistrictUnits);
router.get('/state',tokenService.verifyWebUser, unitController.getAllUnits);
router.put('/:unitId',tokenService.verifyWebUser, unitController.updateUnit);
router.delete('/:unitId',tokenService.verifyWebUser, unitController.deleteUnit);
router.get('/state/:districtid', unitController.getAllstateUnits);

router.get('/',tokenService.verifyWebUser, unitController.getunitmember);

module.exports = router;