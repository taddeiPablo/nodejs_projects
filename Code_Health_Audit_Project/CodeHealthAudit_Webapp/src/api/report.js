// src/api/report.js
const express = require("express");
const router = express.Router();

const apiKeyAuth = require("../middleware/apiKeyAuth");
const reportsController = require("../../controllers/reportsController");

router.post("/", apiKeyAuth, reportsController.createReport);

module.exports = router;

