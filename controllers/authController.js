
const authService = require('../services/authService');

exports.createUser = async (req, res) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const userData = req.body;
    const loginResult = await authService.loginUser(userData);

    if (loginResult.error== 'Invalid username...!') {
      return res.status(400).json({ status: 'failed', message: 'Invalid username' });

    }
 else if (loginResult.error== 'Invalid password..!'){
  return res.status(400).json({ status: 'failed', message: 'Invalid password' });
     }
    const token = loginResult.token;
    return res.status(200).json({ status: 'success', token}); 

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};