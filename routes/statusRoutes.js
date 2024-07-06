const express = require('express');
const router = express.Router();    
const statusController = require('../controllers/statusController')
const tokenService = require('../utils/JWTtokenService');

router.get('/:userid',tokenService.verifyCommonUser, statusController.getaccstatus);

router.get('/TermsAndConditions/:statusId',  statusController.getTermsAndConditions);
router.get('/PrivacyPolicy/:statusId',  statusController.getPrivacyPolicy);

router.get('/familymember/:userId', tokenService.verifyCommonUser, statusController.getfamilymember);



module.exports = router;