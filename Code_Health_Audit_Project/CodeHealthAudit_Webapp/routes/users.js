var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/Login', function(req, res, next){
  res.render('login');
});

router.get('/Sign-up', function(req, res, next){ 
  res.render('singup');
});

module.exports = router;
