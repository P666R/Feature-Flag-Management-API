const express = require('express');
const {
  getFlags,
  getFlag,
  createFlag,
  updateFlag,
  deleteFlag,
} = require('../controllers/flagController');

const { protect, authorize } = require('../middleware/auth');
const { validate, flagValidationRules } = require('../middleware/validator');

const router = express.Router();

// All routes below this middleware require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getFlags)
  .post(validate(flagValidationRules.create), createFlag);

router
  .route('/:id')
  .get(getFlag)
  .put(validate(flagValidationRules.update), updateFlag)
  .delete(deleteFlag);

module.exports = router;
