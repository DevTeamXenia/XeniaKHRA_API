const paymentService = require('../services/paymentService');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZROPAY_KEYID,
  key_secret: process.env.RAZROPAY_SECRET
});


exports.createOrder = async (req, res) => {
  const { orderId, amount, currency } = req.body;

  try {
    const options = {
      amount: amount * 100, 
      currency: currency,
      receipt: orderId,
      payment_capture: 0 
    };

    const order = await razorpay.orders.create(options);

    const rzOrderResponse = {
      OrderId: order.id
    };

    res.status(200).json(rzOrderResponse);
  } catch (error) {
    res.status(400).json({ error: error.toString() });
  }
};


exports.getOrderStatus = async (req, res) => {
  const { paymentId } = req.params; 

  console.log(paymentId);

  try {
    const order = await razorpay.payments.fetch(paymentId);
    const rzCaptureResponse = {
      OrderId: order.order_id,
      Method: order.method,
      Amount: order.amount,
      Status: order.status,
    };

    res.status(200).json(rzCaptureResponse);
  } catch (error) {
    res.status(400).json({ error: error.toString() });
  }
};



exports.getAllPayment = async (req, res, next) => {
    try {
      const payment = await paymentService.getAllPayment();
      res.json(payment);
    } catch (error) {
      next(error);
    }
  };
  

  exports.updatePayment = async (req, res, next) => {
    const { settingId } = req.params; 
    const settings = req.body.settings; 

    try {
        const updated = await paymentService.updatePayments(settings);
        if (updated) {
            res.status(200).json(updated);
        } else {
            res.status(404).json({ error: 'No settings were updated' });
        }
    } catch (error) {
        next(error);
    }
};

exports.registrationPayment = async (req, res, next) => {
  const { userid } = req.params;
  try {
    const registration = await paymentService.registrationPayment(userid, req.body);
    res.status(200).json(registration);    
  } catch (error) {
    next(error);
  }
};


exports.contributionPayment = async (req, res, next) => {
  const { userid } = req.params;
  try {
    const contribution  = await paymentService.contributionPayment(userid,req.body); 
    res.status(200).json(contribution);
  } catch (error) {
    next(error);
  }
};


