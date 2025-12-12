const express = require("express");
const router = express.Router();
const requireAuth = require("../src/middleware/authGuard");
const profileController = require("../controllers/profileController");
const upload = require("../src/middleware/upload");

router.get("/", requireAuth, profileController.getProfile);
router.post("/", requireAuth, upload.single("avatar"), profileController.updateProfile);
//router.post("/update", requireAuth, profileController.updateProfile);

module.exports = router;