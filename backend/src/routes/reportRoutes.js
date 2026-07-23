const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/dashboard', ctrl.getDashboard);
router.get('/revenue', ctrl.getRevenue);
router.get('/customer-growth', ctrl.getCustomerGrowth);
router.get('/claims-overview', ctrl.getClaimsOverview);

module.exports = router;
