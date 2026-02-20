const router = require("express").Router();


const { setOrUpdateLogo, getLogo } = require("../controllers/logo.controller");
router.post("/", setOrUpdateLogo); // new upload or update
router.get("/", getLogo);
module.exports = router;
