const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getAll);
router.get('/summary', ctrl.getSummary);
router.post('/', ctrl.create);

module.exports = router;
