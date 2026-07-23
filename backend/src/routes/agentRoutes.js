const router = require('express').Router();
const ctrl = require('../controllers/agentController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);

module.exports = router;
