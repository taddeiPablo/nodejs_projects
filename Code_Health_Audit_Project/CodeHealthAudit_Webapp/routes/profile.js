const express = require("express");
const router = express.Router();
const requireAuth = require("../src/middleware/authGuard");
const profileController = require("../controllers/profileController");

router.get("/", requireAuth, profileController.getProfile);
//router.post("/update", requireAuth, profileController.updateProfile);

module.exports = router;