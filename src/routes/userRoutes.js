const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { validate, userValidationRules } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes below this middleware require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getUsers)
  .post(validate(userValidationRules.create), createUser);

router
  .route('/:id')
  .get(getUser)
  .put(validate(userValidationRules.update), updateUser)
  .delete(deleteUser);

module.exports = router;
