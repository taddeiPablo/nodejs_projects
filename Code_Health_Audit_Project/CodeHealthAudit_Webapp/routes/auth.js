var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");

// vistas
router.get("/login", authController.showLogin);
router.get("/register", authController.showRegister);

// acciones
router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/logout", authController.logout);

module.exports = router;
