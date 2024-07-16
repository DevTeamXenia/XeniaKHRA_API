const express = require('express');
const router = express.Router();    
const advertisementController = require('../controllers/advertisementController')
const tokenService = require('../utils/JWTtokenService');

router.post('/create', tokenService.verifyWebUser, advertisementController.createadvertisement);
router.put('/:advertisementId',tokenService.verifyWebUser, advertisementController.updateAdvertisement);
router.get('/search/:partialName', tokenService.verifyWebUser, advertisementController.getInformation);

router.get('/state', tokenService.verifyWebUser, advertisementController.getStateadvertisement);
router.put('/Approve/:advertisementId', tokenService.verifyWebUser, advertisementController.ApproveAdvertisement);
router.get('/advertisementList',  advertisementController.getadvertisementList);
module.exports = router;