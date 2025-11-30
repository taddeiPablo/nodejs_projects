var express = require('express');
var router = express.Router();

const authGuard = require("../src/middleware/authGuard");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Aqui el Home de la app' });
});

router.get("/dashboard", authGuard, async (req, res) => {
  const { supabase } = require("../src/services/supabase");

  // obtener reportes del usuario logueado
  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  res.render("dashboard", {
    user: req.user,
    reports
  });
});

module.exports = router;
