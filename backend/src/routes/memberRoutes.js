const express = require('express');

const { protect } = require('../middleware/auth');
const {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const {
  createMemberValidator,
  updateMemberValidator,
} = require('../validators/memberValidator');

const router = express.Router();

router.use(protect);

router.get('/', getMembers);

router.post('/', createMemberValidator, createMember);

router.put('/:id', updateMemberValidator, updateMember);

router.delete('/:id', deleteMember);

module.exports = router;
