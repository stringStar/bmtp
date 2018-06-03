var express = require('express');
var router = express.Router();
import User from '../controller/user'
import Crawler from '../controller/crawler';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/v1/index/list', function(req, res, next) {
  res.send({
    error_code: 0,
    data: {
      banner: [],
      list: []
    },
    message: 'success'
  })
})

router.get('/users', function(req, res, next) {
  res.render('index', { title: 'Express users' });
});


router.get('/v1/user', User.addUser);
router.get('/v1/getcntkitty', Crawler.getCNTKitty)

module.exports = router;
