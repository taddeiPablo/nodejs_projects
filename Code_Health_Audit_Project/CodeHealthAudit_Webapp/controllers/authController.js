const { supabase } = require("../src/services/supabase");
const jwt = require('jsonwebtoken');

// === mostrar vistas ===
exports.showLogin = (req, res) => {
  res.render("auth/login");
};

exports.showRegister = (req, res) => {
  res.render("auth/register");
};

// === Registro ===
exports.register = async (req, res) => {
  /*const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.render("auth/register", { error: error.message });
  }

  return res.redirect("/auth/login");*/
  try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).render('register', {
          error: "Email y contraseña son requeridos."
        });
      }

      // Verificar si ya existe un usuario
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        return res.status(400).render('register', {
          error: "El email ya está registrado."
        });
      }

      // Crear usuario en auth.users
      const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (signUpError) {
        console.error(signUpError);
        return res.status(500).render('register', { error: "Error creando usuario." });
      }

      // Insertar perfil
      await supabase.from("profiles").insert({
        id: user.user.id,
        email,
        full_name: name || null
      });

      return res.redirect('/login');

    } catch (err) {
      console.error(err);
      return res.status(500).render('register', { error: "Error interno." });
    }
};

// === Login ===
exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data?.user) {
        return res.status(401).render('login', {
          error: "Credenciales inválidas."
        });
      }
      console.log("datos del usuario logueado");
      console.log(data.user.email);
      console.log(data.user.id);
      const token = jwt.sign(
        { 
          id: data.user.id,
          email: data.user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
      });

      return res.redirect('/dashboard');

    } catch (err) {
      console.error(err);
      return res.status(500).render('login', {
        error: "Error interno."
      });
    }
};

// === Logout ===
exports.logout = async (req, res) => {
  res.clearCookie("sb_access_token");
  res.redirect("/auth/login");
};
