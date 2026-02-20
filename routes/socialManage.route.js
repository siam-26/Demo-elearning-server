const router = require("express").Router();

const controller = require('../controllers/socialManage.controller');

router.post('/', controller.createSocialLink);
router.get('/', controller.getAllSocialLinks);
router.get('/:id', controller.getSocialLinkById);
router.patch('/:id', controller.updateSocialLink);
router.delete('/:id', controller.deleteSocialLink);

module.exports = router;
