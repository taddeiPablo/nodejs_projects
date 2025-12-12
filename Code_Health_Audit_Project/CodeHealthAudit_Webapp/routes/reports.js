const express = require("express");
const router = express.Router();
const authRequired = require("../src/middleware/authGuard");
const reportsController = require("../controllers/reportsController");

router.get("/", authRequired, reportsController.reportsFindAll);
router.get("/:id", authRequired, reportsController.reportFindById);
router.get("/:id/pdf", authRequired, reportsController.exportReportPdf);
router.post("/:id/delete", authRequired, reportsController.deleteReport);
router.get("/:id/compare", authRequired, reportsController.compareReports);

module.exports = router;