const express = require('express');

const {
  getUsers,
  approveUser,
  changeUserStatus,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireSuperUser } = require('../middleware/authorize');

const router = express.Router();

router.use(protect);
router.use(requireSuperUser);

router.get('/', getUsers);
router.put('/:id/approve', approveUser);
router.put('/:id/status', changeUserStatus);

module.exports = router;
