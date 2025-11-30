require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const reportRouter = require('./src/api/report');
const auth = require('./routes/auth');
const reportsRouter = require('./routes/reports');

var app = express();

// ============================
// 🔐 Seguridad básica
// ============================
app.use(helmet()); // agrega headers de seguridad


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// páginas de login y registro
app.use('/auth', auth);

// ============================
// 📡 API Rate Limit (solo para /api/report)
// ============================
const reportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30, // máximo 30 requests por minuto
  message: { error: "Rate limit exceeded" },
});

// ============================
// 🔥 Rutas API
// ============================

// Aplica rate-limit solo a este endpoint
app.use('/api/report', reportLimiter);

// Aplica el router real
app.use('/api/report', reportRouter);

app.use('/reports', reportsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
