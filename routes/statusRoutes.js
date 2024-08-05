const express = require('express');
const router = express.Router();    
const statusController = require('../controllers/statusController')
const tokenService = require('../utils/JWTtokenService');

router.get('/check/:userid',tokenService.verifyCommonUser, statusController.getaccstatus);

router.get('/server',statusController.checkServerStatus);

//remove this after app update
router.get('/:userid',tokenService.verifyCommonUser, statusController.getaccstatus);

router.get('/TermsAndConditions/:statusId',  statusController.getTermsAndConditions);

router.get('/PrivacyPolicy/:statusId',  statusController.getPrivacyPolicy);

router.get('/familymember/:userId', tokenService.verifyCommonUser, statusController.getfamilymember);

router.put('/deactivate/:userId', tokenService.verifyCommonUser, statusController.memberDeactivation);

module.exports = router;