const express = require('express');
const homecontroller = require("../controller/homecontroller");
const router = express.Router();
router.get("/" , homecontroller.todohome);
module.exports = router