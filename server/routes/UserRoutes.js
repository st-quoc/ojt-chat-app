const router = require('express').Router();
const UserController = require('../controllers/UserController');
const {
  validateRegistration,
  validateLogin,
} = require('../middlewares/ValidateMiddleware');

router.post('/register', validateRegistration, UserController.registerUser);
router.post('/login', validateLogin, UserController.loginUser);
router.post('/request-password-reset', UserController.requestPasswordReset);
router.post('/reset-password/:token', UserController.resetPassword);

module.exports = router;
