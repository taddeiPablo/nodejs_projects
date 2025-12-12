const jwt = require("jsonwebtoken");

module.exports = function authGuard(req, res, next) {
 const token = req.cookies.auth_token;

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { 
      id: decoded.id,
      email: decoded.email == null ? "No registrado" : decoded.email 
    };
    next();
    
  } catch (error) {
    return res.redirect("/auth/login");
  }
};
