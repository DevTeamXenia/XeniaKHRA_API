const express = require('express');
const router = express.Router();    
const contributionController = require('../controllers/contributionController')
const tokenService = require('../utils/JWTtokenService');

router.post('/create', tokenService.verifyWebUser, contributionController.createContribution);
router.get('/searchMember/:partialName', tokenService.verifyWebUser, contributionController.getMember);
router.put('/:ContributionId',tokenService.verifyWebUser, contributionController.updateContribution);
router.get('/state/:status/:ContributionId?', tokenService.verifyWebUser, contributionController.getStateContribution);
router.get('/district/:status/:districtid?/:ContributionId?', tokenService.verifyWebUser, contributionController.getDistrictContribution);
router.get('/unit/:status/:unitid?/:ContributionId?', tokenService.verifyWebUser, contributionController.getUnitContribution);
router.get('/pending/memberDtls',tokenService.verifyAppUser,contributionController.conPendingDetails);
router.get('/payed/memberDtls',tokenService.verifyAppUser,contributionController.conPayedDetails);
router.put('/Approve/:contributionId', tokenService.verifyWebUser, contributionController.ApproveContribution);


router.get('/details/:ContributionId?', tokenService.verifyWebUser, contributionController.getContributionDetails);
router.get('/notification/:memberid',tokenService.verifyAppUser,contributionController.contibutionAmountNotification);

module.exports = router;