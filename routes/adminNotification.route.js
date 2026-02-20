const { getAdminNotifications } = require("../controllers/adminNotification.controller");






const router = require("express").Router();


router.get('/', getAdminNotifications);

module.exports = router;