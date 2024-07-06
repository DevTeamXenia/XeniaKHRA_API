const express = require('express');
const router = express.Router();    
const memberController = require('../controllers/memberController')
const tokenService = require('../utils/JWTtokenService');

router.get('/verify/:membershipNumber', memberController.getmember);

router.get('/state/:status/:pending?', tokenService.verifyWebUser, memberController.getAllStateWiseMember);
router.get('/district/:status/:districtid?', tokenService.verifyWebUser, memberController.getAllDistrictWiseMember);
router.get('/unit/:status/:unitid?', tokenService.verifyWebUser, memberController.getAllUnitWiseMember);
router.get('/search/memberDtls/:memberid',tokenService.verifyCommonUser, memberController.getmemberdtls);
router.put('/:userId',tokenService.verifyCommonUser, memberController.updatememstatus);
router.get('/childMembers/outstanding/:userId', tokenService.verifyAppUser, memberController.getmemOutstanding);


//----app member listing and approve----
router.get('/childMembers/pendingApprove/:userId',tokenService.verifyAppUser, memberController.getpendingApproveDetails);
router.put('/childMembers/approve/:userId',tokenService.verifyAppUser, memberController.childMemberApprove);

module.exports = router;