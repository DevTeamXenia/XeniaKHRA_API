const express = require('express');
const router = express.Router();    
const reportController = require('../controllers/reportController')
const tokenService = require('../utils/JWTtokenService');


router.get('/contribution/state/:status', tokenService.verifyWebUser, reportController.StateContribution);
router.get('/contribution/district/:status', tokenService.verifyWebUser, reportController.DistrictContribution);
router.get('/contribution/unit/:status', tokenService.verifyWebUser, reportController.UnitContribution);
router.get('/payment',tokenService.verifyWebUser, reportController.payment);
router.get('/event',tokenService.verifyWebUser, reportController.getEvent);

module.exports = router;