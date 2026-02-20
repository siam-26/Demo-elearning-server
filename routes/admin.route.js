
const adminControllar = require('../controllers/admin.controller');

const router = require("express").Router();

router.post('/create', adminControllar.createAdmin);
router.post('/login', adminControllar.loginAdmin);
router.get('/', adminControllar.getAdmin);
router.get('/dashboard', adminControllar.dashboard);
router.get('/single-admin/:id', adminControllar.getSingleAdmin);
// GET /api/admin/users - Get all users with pagination and filtering
router.get("/users", adminControllar.getAllUsers)

// GET /api/admin/users/stats - Get user statistics
router.get("/users/stats", adminControllar.getUserStats)

// GET /api/admin/users/:id - Get single user by ID
router.get("/users/:id", adminControllar.getUserById)

// PUT /api/admin/users/:id/status - Update user status
router.put("/users/:id/status", adminControllar.updateUserStatus)
router.patch('/update-admin-byPatch/:id', adminControllar.updateAdmin);
router.put('/update-admin-byPut/:id', adminControllar.updateAdmin);
router.delete('/delete/:id', adminControllar.deleteAdmin);


// PUT /api/v1/admin/users/:userId/verify
router.put("/users/:userId/verify", adminControllar.verifyUser);

module.exports = router;