const router = require("express").Router();

const { createCompanyVerificationController, getAllCompanyVerificationsController, getAllVerifiedCompanysController, getSingleCompanyVerificationController, updateCompanyVerificationController, deleteCompanyVerificationController } = require("../controllers/verifyComnay.controller");



router.post('/create', createCompanyVerificationController);
router.get('/', getAllCompanyVerificationsController);
router.get('/verified', getAllVerifiedCompanysController);
router.get('/single/:id', getSingleCompanyVerificationController);
router.patch('/single/:id', updateCompanyVerificationController);
router.delete('/single/:id', deleteCompanyVerificationController);

module.exports = router;
