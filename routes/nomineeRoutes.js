const express = require('express');
const router = express.Router();    
const nomineeController = require('../controllers/nomineeControler')
const tokenService = require('../utils/JWTtokenService');

router.get('/:userId?', tokenService.verifyCommonUser, nomineeController.getNominee);
router.post('/:userId',tokenService.verifyCommonUser, nomineeController.updatenominee);
router.put('/:userId',tokenService.verifyCommonUser, nomineeController.approveNominee);

module.exports = router;