const router = require("express").Router();
const SessionController = require("../controllers/SessionController");

router.get("/:id", SessionController.getSessionById);

module.exports = router;
