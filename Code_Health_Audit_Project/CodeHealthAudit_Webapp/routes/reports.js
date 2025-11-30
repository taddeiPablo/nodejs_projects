const express = require("express");
const router = express.Router();
const authRequired = require("../src/middleware/authGuard");
const { supabase } = require("../src/services/supabase");

router.get("/", authRequired, async (req, res) => {
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  res.render("reports/list", { reports });
});

router.get("/:id", authRequired, async (req, res) => {
  const reportId = req.params.id;

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (!report) return res.status(404).send("Reporte no encontrado");

  res.render("reports/detail", { report });
});

module.exports = router;