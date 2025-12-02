const express = require("express");
const router = express.Router();
const requireAuth = require("../src/middleware/authGuard");
const crypto = require("crypto");
const supabase = require("../src/lib/supabaseClient");

// Listar API Keys
router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { data: keys, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  res.render("apiKeys/index", {
    user: req.user,
    keys,
  });
});

// FORMULARIO: crear nueva API KEY VIEW
router.get("/new", requireAuth, (req, res) => {
  res.render("apiKeys/newKey", { user: req.user });
});
// Crear API key
router.post("/create", requireAuth, async (req, res) => {
  const userId = req.user.id;

  // 1. Generar clave segura: chp_xxxxx
  const rawKey = `chp_${crypto.randomBytes(24).toString("hex")}`;
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  // 2. Guardar SOLO el hash en la BD
  const { error } = await supabase
    .from("api_keys")
    .insert({
      user_id: userId,
      hashed_key: hashedKey,
      label: req.body.label || "Nueva API Key",
    });

  if (error) {
    console.error(error);
    return res.status(500).send("Error al crear la API Key");
  }

  // 3. Redirigir a la pantalla especial que muestra la clave RAW
  //return res.redirect(`/api-keys/created?key=${rawKey}`);
  return res.render("apiKeys/created", {
    user: req.user,
    rawKey
  });
});
// Revocar API Key
router.post("/:id/revoke", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const keyId = req.params.id;

  const { error } = await supabase
    .from("api_keys")
    .update({ revoked: true })
    .eq("id", keyId)
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return res.status(500).send("No se pudo revocar la clave");
  }

  res.redirect("/api-keys");
});
// Mostrar clave creada
router.get("/created", requireAuth, (req, res) => {
  const rawKey = req.query.key;

  if (!rawKey) {
    return res.status(400).send("Missing key");
  }

  /*res.render("apiKeys/created", {
    user: req.user,
    key: rawKey,
  });*/
  router.get("/created", requireAuth, (req, res) => {
    return res.redirect("/api-keys"); // Si entran directo, redirigimos a la lista.
  });
});
// Eliminar API Key
router.post("/:id/delete", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return res.status(500).send("Error al eliminar la API Key");
  }

  res.redirect("/api-keys");
});
// Regenerar API Key
router.post("/:id/regenerate", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // 1. Revocamos la actual
  await supabase
    .from("api_keys")
    .update({ revoked: true })
    .eq("id", id)
    .eq("user_id", userId);

  // 2. Generamos nueva
  const rawKey = `chp_${crypto.randomBytes(24).toString("hex")}`;
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  const { error, data } = await supabase
    .from("api_keys")
    .insert({
      user_id: userId,
      hashed_key: hashedKey,
      label: "Clave regenerada",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).send("No se pudo regenerar la API Key");
  }

  // 3. Redirigimos para mostrar la nueva key una sola vez
  res.render("apiKeys/created", {
    user: req.user,
    rawKey,
  });
});

module.exports = router;
