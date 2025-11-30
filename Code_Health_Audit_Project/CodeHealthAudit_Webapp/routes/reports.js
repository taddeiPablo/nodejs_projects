const express = require("express");
const router = express.Router();
const authRequired = require("../src/middleware/authGuard");
const { supabase } = require("../src/services/supabase");

router.get("/", authRequired, async (req, res) => {
 const userId = req.user.id;

  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).send("Error al cargar reportes");
  }

  res.render("reports/index", {
    user: req.user,
    reports,
  });
});

router.get("/:id", authRequired, async (req, res) => {
  const reportId = req.params.id;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).send("Reporte no encontrado");
  }

  res.render("reports/detail", {
    user: req.user,
    report: data,
  });
});

module.exports = router;