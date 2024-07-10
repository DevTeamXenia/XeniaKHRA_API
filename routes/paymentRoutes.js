const express = require('express');
const router = express.Router();  
const paymentController = require('../controllers/paymentController')
const tokenService = require('../utils/JWTtokenService');


router.get('/',tokenService.verifyCommonUser, paymentController.getAllPayment);
router.put('/update', tokenService.verifyCommonUser, paymentController.updatePayment);
router.post('/registration/:userid', tokenService.verifyCommonUser, paymentController.registrationPayment);
router.post('/contribution/:userid', tokenService.verifyCommonUser, paymentController.contributionPayment);
router.post('/RazorPay/CreateOrder', tokenService.verifyCommonUser, paymentController.createOrder);
router.get('/RazorPay/OrderCapture/:paymentId', tokenService.verifyCommonUser, paymentController.getOrderStatus);


module.exports = router;