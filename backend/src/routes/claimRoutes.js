const router = require('express').Router();
const ctrl = require('../controllers/claimController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.put('/:id/approve', ctrl.approve);
router.put('/:id/reject', ctrl.reject);

module.exports = router;
