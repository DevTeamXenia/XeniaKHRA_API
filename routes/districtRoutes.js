const express = require('express');
const router = express.Router();  
const districtController = require('../controllers/districtController')
const tokenService = require('../utils/JWTtokenService');

router.get('/', districtController.getAllDistrict);
router.put('/:districtid',tokenService.verifyWebUser, districtController.updatedistrict);

module.exports = router;