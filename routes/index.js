var express = require("express");
var router = express.Router();
import User from "../controller/user";
import WallList from "../controller/wallList";

/* GET home page. */

router.get("/v1/index/list", function(req, res, next) {
  res.send({
    error_code: 0,
    data: {
      banner: [],
      list: []
    },
    message: "success"
  });
});

router.get("/v1/get_price_top", WallList.getPriceTop);

module.exports = router;
