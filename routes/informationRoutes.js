const express = require('express');
const router = express.Router();    
const informationController = require('../controllers/informationController')
const tokenService = require('../utils/JWTtokenService');


router.post('/create', tokenService.verifyWebUser, informationController.createInformation);
router.put('/:informationId',tokenService.verifyWebUser, informationController.updateInformation);
router.get('/search/:partialName', tokenService.verifyWebUser, informationController.getInformation);

router.get('/state', tokenService.verifyWebUser, informationController.getStateInformation);
router.put('/Approve/:informationId', tokenService.verifyWebUser, informationController.ApproveInformation);

module.exports = router;