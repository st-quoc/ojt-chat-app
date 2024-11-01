const AuthServices = require('../services/AuthService');
const ApiResponse = require('../helpers/ApiResponse');

exports.registerUser = async (req, res) => {
  try {
    const result = await AuthServices.register(req.body);
    ApiResponse.success(res, result, 'User registered successfully');
  } catch (error) {
    ApiResponse.error(res, error.message, 500);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const result = await AuthServices.login(req.body.email, req.body.password);
    ApiResponse.success(res, result);
  } catch (error) {
    ApiResponse.error(res, error.message, 401);
  }
};
