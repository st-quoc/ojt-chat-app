const router = require("express").Router();
const UserController = require("../controllers/UserController");
const {
  validateRegistration,
  validateLogin,
} = require("../middlewares/ValidateMiddleware");

router.post("/register", validateRegistration, UserController.registerUser);
router.post("/login", validateLogin, UserController.loginUser);

module.exports = router;
