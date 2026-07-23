const router = require('express').Router();
const ctrl = require('../controllers/auditLogController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getAll);

module.exports = router;
